const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const app = express()

const taskMongoose = require('./models/taskMongo')
const userModel = require('./models/user')
const passport = require('./auth')

mongoose.connect('mongodb://192.168.99.100:32768/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(express.urlencoded({extended: false}))
app.use(session({
    resave: true,
    saveUninitialized: false,
    rolling: true,
    secret: 'lw23er98dshaskbdsa7tdcs8aujb2kj3dYTkberYURX7623xxb23*&^Axuhyqgdiq',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {},
}))

app.use(passport.initialize)
app.use(passport.session)
app.use(express.json())

app.use('/', passport.mustBeAuthenticated)

app.get('/' , async (req, res) => {
    const tasks = await taskMongoose.find({}).lean()
    //res.json(tasks)
    req.session.touch()
    res.render('crud', {tasks, user : req.user.email})
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
        (err) => {if (err) {console.log(err)}})
    res.redirect('/')
})

app.get('/edit/:id', async (req, res) => {
    const task = await taskMongoose.findById(req.params.id).lean()
    res.render('editForm', {task})
})

app.get('/login', async (req, res) => {
    const { error } = req.query
    res.render('login', { error })
})

app.get('/reg', async (req, res) => {
    res.render('reg')
})

app.post('/login', (req, res, next) => {
        if ( req.body.remember ) {
            req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000 // Expires in 7 day of inactivity
        } else {
            req.session.cookie.expires = false
        }
        next()
    }, passport.authenticate
)

app.post('/reg', async (req, res) => {
    const { repassword, ...restBody } = req.body
    if(restBody.password === repassword){
        const user = new userModel(restBody)
        await user.save()
        res.redirect('/login')
    } else {
        res.redirect('/reg?err=repass')
    }
})
app.get('/logout', (req, res)=>{
    req.logout()
    res.redirect('/auth')
})

app.listen(4000, () => {
    console.log('The server has been started!')
})