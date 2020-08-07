const clc = require('cli-color');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { DB_NAME, DB_PORT, DB_HOST, PORT, SERVER_URL, SECRET_KEY } = require('./config');

const Task = require('./models/Task');
const User = require('./models/User');
const authMiddleware = require('./authMiddleware');

mongoose.connect(`${ DB_HOST }:${ DB_PORT}/${ DB_NAME }`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const app = express();

app.use( express.json() );
app.use( express.urlencoded({ extended: false }) );
app.use( cors() );
app.use('/tasks', authMiddleware.checkAuth );

app.get('/', ( req, res ) => {
  res.status( 403 ).send();
});

app.get('/tasks', async ( req, res ) => {
  const { _id } = req.user;
  const tasks = await Task.find({ user: _id }).lean();
  res.status( 200 ).json(tasks);
});

app.post('/tasks', async ( req, res ) => {
  const { _id } = req.user;
  const task = new Task({ ...req.body, user: _id });  

  await task.validate( async (errors) => {
    if ( errors ) {
      return res.status( 400 ).json( errors );
    }
    const isSaved = task.save();
    if ( isSaved ) {
      return res.status( 201 ).send();
    }
    return res.status( 500 ).send();
  });
});

app.delete('/tasks/:id', async ( req, res ) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete( id );
    res.status( 204 ).send();
  } catch( error ) {
    res.status( 500 ).json( error );
  }
});

app.patch('/tasks/:id', ( req, res ) => {
  const { params: { id }, body } = req;
  Task.findOneAndUpdate({ _id: id }, { $set: body }, { new: true }, ( err, value ) => {
    if ( err ) {
      return res.status(500).json( err );
    }
    res.status(200).send(value);
  });
});

/** регистрация обработка формы */
app.post('/signup', async ( req, res ) => {
  const { body: { repassword, ...userProps } } = req;
  const user = new User( userProps );
  const validateErrors = user.validateSync() || { errors: []};

  if ( repassword !== userProps.password ) {
    validateErrors.errors.password = 'passwords is not much';
  } 
  const errors = Object.values( validateErrors.errors );
  if ( errors.length ) {
    return res.status( 400 ).json( errors );
  } 
  const isSaved = await user.save();

  res.status( 200 ).json( isSaved );
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if ( !user || !user.validatePassword( password ) ) {
    return res.status(401).send();
  }

  const plainUser = JSON.parse(JSON.stringify(user))
  delete plainUser.password

  res.status(200).json({
    ...plainUser,
    token: jwt.sign( plainUser, SECRET_KEY ),
  });
});

app.listen( PORT, () => console.log(
  clc.yellow(`==================== Server start ====================\n`),
  clc.green(`\t${ SERVER_URL }:${ PORT }`)
));