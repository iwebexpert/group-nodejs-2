/**
 * Created by ankho on 27.07.2020.
 */
const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

const taskMongoose = require('./models/taskMongo')

mongoose.connect('mongodb://localhost:27017/todo', {
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

app.get('/tasks', async (req, res) => {
    const tasks = await taskMongoose.find({})
    res.json(tasks)
})

app.post('/tasks', async (req, res) => {
    const task = new taskMongoose(req.body)
    const isSaved = await task.save()
    res.json(isSaved)
})

app.put('/tasks', async (req, res) => {
    const { id, title, completed } = req.body
    const task = await taskMongoose.findById( id )

    const updatedTask = {
        title: title ? title : task.title,
        completed: completed ? completed : task.completed,
    }

    taskMongoose.updateOne({_id: id}, updatedTask, {new: true}, function(err, task){
        if(err) return console.log(err)
    })

    res.redirect('/tasks')
})

app.delete('/tasks', async (req, res) => {
    await taskMongoose.findByIdAndDelete({_id: req.body.id}, function(err, task){
        if(err) return console.log(err)
    })

    res.redirect('/tasks')
})

app.listen(4000, () => {
    console.log('The server has been started!')
})