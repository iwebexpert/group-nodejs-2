const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const mongoose = require('mongoose')

const app = express()

const taskMongoose = require('./models/taskMongo')

mongoose.connect('mongodb://192.168.99.100:32768/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.get('/', async (req, res) => {
    const tasks = await taskMongoose.find({}).lean()
    //res.json(tasks)
    res.render('crud', {tasks})
})

app.post('/add', async (req, res) => {
    const task = new taskMongoose(req.body)
    const isSaved = await task.save()
    res.redirect('/')
})

app.post('/delete/:id', async (req, res) => {
    taskMongoose.deleteOne({_id: req.params.id}, (err) => {
        if (err) {
            console.log(err)
        }
    })
    res.redirect('/')
})

app.post('/update/:id', async (req, res) => {
    taskMongoose.updateOne(
        {_id: req.params.id},
        {title: req.body.title, priority: req.body.priority},
        (err, resp) => {if (err) {console.log(err)}})
    res.redirect('/')
})

app.get('/edit/:id', async (req, res) => {
    const task = await taskMongoose.findById(req.params.id).lean()
    res.render('editForm', {task})
})

app.listen(4000, () => {
    console.log('The server has been started!')
})