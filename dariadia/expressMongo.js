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
  res.render("Hello world!")
});

app.get('/tasks', async (req, res) => {
  const tasksHelper = await taskMongoose.find({})
  const tasks = []; // We have to do sth, because of this error: "Handlebars: Access has been denied to resolve the property "title" because it is not an "own property" of its parent." It's easy to just reassemble another array of objects.
  for (let i of tasksHelper) {
    tasks.push({
      title: i.title, 
      status: i.status, 
      priority: i.priority, 
      priorityKey: i.priority === 'high' ? 1 : 0, // Helps to colour the "priority" elements because handlebars doesn't handle conditioning rather than exists/not (aka 0, null – 1, 'string')
      id: i._id 
    })
  }
  res.render("tasks", {tasks})
})

app.post('/tasks', async (req, res) => {
  const task = new taskMongoose(req.body)
  await task.save()
  res.redirect('/tasks')
})

app.put('/tasks', async (req, res) => {
  if(!req.body) return res.sendStatus(400)
  const { id, title, status, priority } = req.body
  const task = await taskMongoose.findById( id )

  const updatedTask = { 
    title: title ? title : task.title,
    status: status ? status : task.status, 
    priority: priority ? priority : task.priority, 
  }
     
  taskMongoose.updateOne({_id: id}, updatedTask, {new: true}, function(err, task){
    if(err) return console.log(err)
  })
  
  res.redirect('/tasks')
})

app.delete('/tasks', async ( req, res ) => {
  if(!req.body) return res.sendStatus(400)

  await taskMongoose.findByIdAndDelete({_id: req.body.id}, function(err, task){
    if(err) return console.log(err)
  })

  res.redirect('/tasks')
});

app.post('/tasks', async (req, res) => {
  if(!req.body) return res.sendStatus(400)

  const task = new taskMongoose(req.body)
  await task.save()

  res.redirect('/tasks')
})

app.listen(config.webPort, () => {
  console.log('The server has been started!')
})
