const express = require('express')
const app = express()
const consolidate = require('consolidate')
const mongoose = require('mongoose');
const path = require('path')

const taskMongoose = require('./models/taskMongo')

mongoose.connect('mongodb://localhost:32777/tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//-------------GET------------------
app.get('/', function(req, res) {
    res.send('Hello World')
})

app.get('/tasks', async(req, res) => {
    const tasks = await taskMongoose.find({})
    res.render('tasks', { tasks: JSON.parse(JSON.stringify(tasks)) })
})

app.get('/tasks/add/:_id?', async(req, res) => {
    if (req.params && req.params._id) {
        task = await taskMongoose.find({ _id: req.params._id })
        res.render('taskAdd', { task: JSON.parse(JSON.stringify(task[0])) })
    } else {
        res.render('taskAdd')
    }
})

//-------------POST------------------
app.post('/tasks/add', async(req, res) => {
    let data = req.body
    if (data.completed) {
        data.completed = true
    } else {
        data.completed = false
    }

    if (data._id) {
        await taskMongoose.updateOne({ _id: data._id }, data, (err) => { console.log(err) })
        res.redirect('/tasks')
    } else {
        const task = new taskMongoose(req.body)
        const isSaved = await task.save()
        res.redirect('/tasks')
    }
})

app.post('/tasks/delete', async(req, res) => {
    await taskMongoose.remove({ _id: req.body._id })
    res.redirect('/tasks')
})

app.listen(4000, () => {
    console.log('Server started on http://localhost:4000')
})