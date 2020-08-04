const express = require('express')
const app = express()
const consolidate = require('consolidate')
const mongoose = require('mongoose');
const path = require('path')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

mongoose.connect('mongodb://localhost:32777/tasks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

//Проверка авторизации
app.use('/tasks', passport.mustBeAutheticated)
app.use('/tasks/add/:_id?', passport.mustBeAutheticated)

app.use('/auth', passport.mustBeGuest)
app.use('/register', passport.mustBeGuest)

//-------------GET------------------
app.get('/', function (req, res) {
    res.redirect('/tasks')
})

app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find({user_id: req.user._id})
    res.render('tasks', {tasks: JSON.parse(JSON.stringify(tasks))})
})

app.get('/tasks/add/:_id?', async (req, res) => {
    if (req.params && req.params._id) {
        task = await taskModel.find({_id: req.params._id})
        res.render('taskAdd', {task: JSON.parse(JSON.stringify(task[0]))})
    } else {
        res.render('taskAdd')
    }
})

//-------------POST------------------
app.post('/tasks/add', async (req, res) => {
    let data = req.body
    if (data.completed) {
        data.completed = true
    } else {
        data.completed = false
    }

    if (data._id) {
        await taskModel.updateOne({_id: data._id}, data, (err) => {
            if (err) console.log(err)
        })
        res.redirect('/tasks')
    } else {
        req.body.user_id = req.user._id
        const task = new taskModel(req.body)
        await task.save()
        res.redirect('/tasks')
    }
})

app.post('/tasks/delete', async (req, res) => {
    await taskModel.remove({_id: req.body._id})
    res.redirect('/tasks')
})

//Registration/Auth
app.get('/register', (req, res) => {
    const err = req.query && req.query.err ? req.query.err : null
    res.render('register', {err})
})

app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body

    if (await userModel.findOne({email: restBody.email})) {
        return res.redirect('/register?err=This_email_is_exists')
    }

    if (restBody.password === repassword) {
        const user = new userModel(restBody)
        await user.save()
        res.redirect('/auth')
    } else {
        res.redirect('/register?err=Password_and_Confirm_Password_does_not_match')
    }
})

app.get('/auth', (req, res) => {
    const {error} = req.query
    res.render('auth', {error})
})

app.post('/auth', passport.authenticate)

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})

app.listen(4000, () => {
    console.log('Server started on http://localhost:4000')
})