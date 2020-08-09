/**
 * Created by ankho on 27.07.2020.
 */
const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const app = express()

const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

mongoose.connect('mongodb://localhost:27017/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

// session
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

//Middleware для работы с form
app.use(express.urlencoded({extended: false}))

//Для работы с JSON
app.use(express.json())

//Проверка авторизации
app.use('/tasks', passport.mustBeAutheticated)
app.use('/task', passport.mustBeAutheticated)


app.get('/tasks', async (req, res) => {
    const tasksObj = await taskModel.find({})
    const tasks = JSON.parse(JSON.stringify(tasksObj))
    res.render('tasks/index', {
        tasks
    })
})

app.get('/task/add', async (req, res) => {
    res.render('tasks/form')
})

app.post('/task/create', async (req, res) => {
    const task = new taskModel(req.body)
    const isSaved = await task.save()

    res.redirect('/tasks')
})

app.get('/task/edit/:id', async (req, res) => {
    const { id } = req.params
    const taskObj = await taskModel.findById(id)
    const task = JSON.parse(JSON.stringify(taskObj))

    res.render('tasks/form', {
        task
    })
})

app.post('/task/update', async (req, res) => {
    const { id, title, completed } = req.body
    const task = await taskModel.findById( id )

    const updatedTask = {
        title: title ? title : task.title,
        completed: completed ? completed : false,
    }

    taskModel.updateOne({_id: id}, updatedTask, {new: true}, function(err, task){
        if(err) return console.log(err)
    })

    res.redirect('/tasks')
})

app.post('/task/remove', async (req, res) => {
    const { id } = req.body
    await taskModel.findByIdAndRemove(id)

    res.redirect('/tasks')
})

app.get('/task/:id', async (req, res) => {
    const { id } = req.params
    const taskObj = await taskModel.findById(id)
    const task = JSON.parse(JSON.stringify(taskObj))

    res.render('tasks/single', {
        task
    })
})

//Registration/Auth
app.get('/register', (req, res) => {
    res.render('users/register')
})

app.post('/register', async (req, res) => {
    const { repassword, ...restBody } = req.body
    if(restBody.password === repassword){
        const user = new userModel(restBody)
        await user.save()
        res.redirect('/auth')
    } else {
        res.redirect('/register?err=repass')
    }
})

app.get('/auth', (req, res) => {
    const { error } = req.query
    res.render('users/auth', { error })
})

app.post('/auth', passport.authenticate)

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})

app.listen(5000, () => {
    console.log('The server has been started!')
})