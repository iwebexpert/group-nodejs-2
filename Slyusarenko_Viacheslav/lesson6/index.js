const clc = require('cli-color');
const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const mongoose = require('mongoose');
const handlebars = require('handlebars');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);

const { DB_NAME, DB_PORT, DB_HOST, PORT, SERVER_URL } = require('./config');
const Task = require('./models/Task');
const User = require('./models/User');
const passport = require('./auth');

const app = express();

mongoose.connect(`${ DB_HOST }:${ DB_PORT}/${ DB_NAME }`, {
  useNewUrlParser: true, useUnifiedTopology: true
});

app.engine( 'hbs', consolidate.handlebars );

app.use( cookieParser() );
app.use( session({
  resave: true,
  saveUninitialized: false,
  secret: 'secret-session-key',
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use( passport.initialize );
app.use( passport.session );
app.use('/tasks', passport.mustBeAutheticated );

app.use( express.json() );
app.use( express.urlencoded( { extended: false } ) );
app.use(
  express.static( path.resolve( __dirname, 'views') )
);

app.set( 'view engine', 'hbs' );
app.set( 'views', path.resolve( __dirname, 'views') );

/**
 * хелпер отрисовки чекбокса
 * @param task
 **/
handlebars.registerHelper('checkBox', ( _id, completed ) => {
  return new handlebars.SafeString(
    `<input data-mode="check" class="btn_check" type="checkbox" data-id="${ _id }" ${ completed ? 'checked' : '' }/>`
  );
});

handlebars.registerHelper('rememberLoginHelper', ( inputName, isChecked ) => {
  return new handlebars.SafeString(
    `<input type="checkbox" name="${ inputName }" ${ isChecked ? 'checked' : '' }/>`
  );
});

/**
* хелпер отрисовки навигационной панели
* @param task 
**/
handlebars.registerHelper('navpanel', ( user, location ) => {
  const isGuest = !( user && user._id );
  /** пути для навигационной панели у гостя */
  const guetsPaths = [
    { title: 'login', url: '/login' },
    { title: 'signup', url: '/signup' },
  ];

  /** пути для навигационной панели у пользователя */
  const userPaths = [
    { title: 'tasks', url: '/tasks' },
    { title: 'logout', url: '/logout' },
  ];

  const currentNavRoutes = ( isGuest ? guetsPaths: userPaths );
  const links = currentNavRoutes.map( ({ url, title }) => {
    const isActiveUrl = (url === location);
    return `<a href="${ url }" class="${ isActiveUrl ? 'active' : '' }">${ title }</a>&nbsp;`
  });
  return new handlebars.SafeString( links.join('') );
});

/** Перенаправляем на страницу задач */
app.get('/', async ( req, res ) => {
  res.redirect( 'tasks' );
});

app.get('/tasks', async ( req, res ) => {
  const { _id } = req.user;
  
  const tasks = await Task.find({ user: _id }).lean();
  res.render( 'index', { tasks, user: req.user });
});

/** создание новой задачи ( запрос выполняется отправкой формы ) */
app.post('/tasks', async ( req, res ) => {
  const { _id } = req.user;
  const task = new Task({ ...req.body, user: _id });  
  await task.validate( async (errors) => {
    if ( !errors ) {
      await task.save();
    }
  });
  res.redirect( '/tasks' );
});

/** удаление задачи ( запрос выполняется в клиентском скрипте ) */
app.delete('/tasks', async ( req, res ) => {
  try {
    const { body: { id } } = req;
    await Task.findByIdAndDelete(id);
    res.send( true );
  } catch( error ) {
    console.error( error )
    res.send( false );
  }
});

/** Переключение статуса задачи ( запрос выполняется в клиентском скрипте ) */
app.put('/tasks/:id', async ( req, res ) => {
  const { params: { id }, body: { completed } } = req;
  try {
    const task = await Task.findById( id );
    task.set( 'completed', completed )
        .save();

    res.send( task );
  } catch( error ) {
    console.log( error )
    res.status( 400 ).send( error );
  }
});

/** Страница редактирования */
app.get('/tasks/update/:id', async ( req, res ) => {
  const { params: { id } } = req;
  const task = await Task.findById( id ).lean();
  res.render( 'update', { task, user: req.user });
});

/**
 * сохранение изменений ( апрос вызывается при отправке формы, поэтому POST а не PUT )
 **/
app.post('/tasks/update/:id', async ( req, res ) => {
  const { params: { id }, body: { title } } = req;

  const task = await Task.findById( id );

  task.set( 'title', title );

  await task.validate(( errors ) => {
    if ( errors ) {
      console.warn( errors );
      return;
    }
    task.save();
  });

  res.redirect( '/tasks');
});

/** вывод формы логина */
app.get('/login', (req, res) => {
  const { query: { error } } = req;
  res.render( 'login', {
    error,
    user: req.user,
    rememberUserName: req.cookies['username']
  });
});

/** обработка логин формы */
app.post( '/login', (req, res) => {
  const { rememberUserName, username } = req.body;

  if ( rememberUserName ) {
    res.cookie( 'username', username );
  } else {
    res.cookie( 'username', '' );
  }
  passport.authenticate( req, res );
});

/** регистрация вывод страници */
app.get('/signup', ( req, res ) => {
  res.render('signup', { user: req.user });
});

/** регистрация обработка формы */
app.post('/signup', async ( req, res ) => {
  const errors = [];
  const { body: { repassword, ...userProps } } = req;
  const user = new User( userProps );

  const validateErrors = user.validateSync();

  if ( validateErrors ) {
    errors.push( ...Object.values( validateErrors.errors) );
  }
 
  if ( repassword !== userProps.password ) {
    errors.push( 'passwords is not much' );
  } 

  if ( !errors.length ) {
    await user.save();
    return res.redirect('/login');
  } 
  res.render('signup', { user: req.body || {}, errors });
});

/** Разлогин и редирект на страницу входа */
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.listen( PORT, () => console.log(
  clc.yellow(`==================== Server start ====================\n`),
  clc.green(`\t${ SERVER_URL }:${ PORT }`)
));