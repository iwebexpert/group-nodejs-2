const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const mongoose = require('mongoose')
var config = require('./config')

const app = express()

const taskMongoose = require('./models/taskMongo')

mongoose.connect(`mongodb://localhost:${config.mongoosePort}/todo`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

//Middleware для работы с form
app.use(express.urlencoded({extended: false}))

//Для работы с JSON
app.use(express.json())

app.get('/', (req, res) => {
  res.render("Hello world!");
});

app.get('/tasks', async (req, res) => {
  const tasks = await taskMongoose.find({})
  res.json(tasks)
  // const result = {tasks: tasks}
  // console.log(result)
  // res.render("tasks", {result});
})

app.post('/tasks', async (req, res) => {
  const task = new taskMongoose(req.body)
  const isSaved = await task.save()
  res.json(isSaved)
})

app.listen(config.webPort, () => {
  console.log('The server has been started!')
})
