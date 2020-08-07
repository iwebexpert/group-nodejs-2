const express = require('express')
const mongoose = require('mongoose')
const handlebars = require('express-handlebars')
const path = require('path')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const passport = require('./controllers/auth')
const taskRouter = require('./routes/task')
const userRouter = require('./routes/user')

const app = express()
const port = 3000
const SECRET = '$uper$ecret$tring'

app.engine('hbs', handlebars({defaultLayout: 'layout'}))
app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.resolve(__dirname, 'styles')))
app.use(express.urlencoded({ extended: true }))
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: SECRET,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.use('/tasks', passport.checkAuth)

app.use('/tasks', taskRouter)
app.use('/', userRouter)

mongoose
    .connect('mongodb://localhost:27017/todo', { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false 
    })
    .then(() => console.log("Mongodb connected"))
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.get('/', (req, res) => {
    res.redirect('login')
})

app.listen(port, () => console.log(`Server running on port ${port}`))