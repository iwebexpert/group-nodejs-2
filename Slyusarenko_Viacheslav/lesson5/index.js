const clc = require('cli-color');
const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const mongoose = require('mongoose');
const handlebars = require('handlebars');

const { DB_NAME, DB_PORT, DB_HOST, PORT, SERVER_URL } = require('./config');
const Task = require('./models/Task');

const app = express();

mongoose.connect(`${ DB_HOST }:${ DB_PORT}/${ DB_NAME }`, {
  useNewUrlParser: true, useUnifiedTopology: true
});

app.engine( 'hbs', consolidate.handlebars );

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

/** Перенаправляем на страницу задач */
app.get('/', async ( req, res ) => {
  res.redirect( 'tasks' );
});

/** Получаем список всех задач */
app.get('/tasks', async ( req, res ) => {
  const tasks = await Task.find().lean();
  res.render( 'index', { tasks });
});

/** создание новой задачи ( запрос выполняется отправкой формы ) */
app.post('/tasks', async ( req, res ) => {
  const task = new Task(req.body);
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
    task.set( 'completed', completed );
    task.save();
    res.send( task );
  } catch( error ) {
    console.log( error )
    res.status( 400 );
    res.send( error );
  }
});

/** Страница редактирования */
app.get('/tasks/update/:id', async ( req, res ) => {
  const { params: { id } } = req;
  const task = await Task.findById( id ).lean();
  res.render( 'update', { task });
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

app.listen( PORT, () => console.log(
  clc.yellow(`==================== Server start ====================\n`),
  clc.green(`\t${ SERVER_URL }:${ PORT }`)
));