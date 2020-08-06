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

app.listen(4000, () => {
    console.log('The server has been started!')
})