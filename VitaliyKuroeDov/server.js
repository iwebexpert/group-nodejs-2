const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const port = 4000
const request = require('request')
const cheerio = require('cheerio')
const app = express()
const Handlebars = require('handlebars')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const music = require('./src/music')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const taskMongoose = require('./src/models/taskMongo')
const userModel = require('./src/models/user')
const passport = require('./auth')


mongoose.connect('mongodb://127.0.0.1:27017/GB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

let news

Handlebars.registerHelper("list", (context, options) => {
    let ret = `<ol class="list">`;
    for ((key) in context) {
        ret = ret + `<li id=${key} class="list__item">` + options.fn({ ...context[key], key }) + "</li>"
    }
    return ret + "</ol>";
})

let users = {
    oleg: {
        username: 'Oleg',
        age: 30,
        defaultNews: 3
    },
    irina: {
        username: 'Irina',
        age: 18,
        defaultNews: 10
    }
}

const getNews = () => {
    request('https://habr.com', (err, res, body) => {
        if (!err && res.statusCode === 200) {
            news = {}
            const $ = cheerio.load(body)

            $('div[class="posts_list"]').find('a[class="post__title_link"]').each((idx, elem) => {
                const title = $(elem).text()
                const link = $(elem).attr('href')
                news = { ...news, [idx]: { title: title, link: link } }
            })
        }
        return news
    })
}

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))
app.use(passport.initialize)
app.use(passport.session)

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, './views'))
app.use('/tasks', passport.mustBeAutheticated)

app.get('/', (req, res) => {
    res.redirect('/tasks')
})



app.get('/news', (req, res) => {
    res.render('news', { news })
})

app.get('/users', (req, res) => {
    res.render('users', { users })
})

app.get('/users/:username', (req, res) => {
    const user = users[req.params.username] ? users[req.params.username] : users['irina']
    res.render('user', { user, news, id: req.params.username })

})

app.post('/users/:username/news', (req, res, next) => {
    const user = { username: req.body.username, countNews: req.body.newsCountDisplay !== '' ? req.body.newsCountDisplay : '15', news: {} }
    const userName = req.body.username
    const userNews = req.body.newsCountDisplay !== '' ? req.body.newsCountDisplay : users[userName].defaultNews

    res.cookie(`${userName}`, userNews, { expires: new Date(Date.now() + 900000), httpOnly: true })

    for (let i = 0; i < req.cookies[userName]; i++) {
        user.news = { ...user.news, [i]: { title: news[i].title, link: news[i].link } }

    }
    res.render('newsList', user)
})
//Список задач
app.get('/tasks', async (req, res) => {
    const tasksList = await taskMongoose.find({}).lean()
    res.render('tasks', { tasksList })
})
//зайти в форму задачи
app.get('/tasks/:id', async (req, res) => {
    const task = await taskMongoose.findById(req.params.id).lean()
    res.render('taskItem', task)
})
//Обновить имя задачи из его формы
app.post('/tasks/:id', async (req, res) => {

    if(req.body.title) {
        await taskMongoose.updateOne({ _id: req.params.id }, { $set: { title: req.body.title }})
    }

    if (req.body.complited) {
        await taskMongoose.updateOne({ _id: req.params.id }, { $set: { complited: req.body.complited }})
    }

    res.redirect('/tasks')
})

//создание задачи
app.post('/tasks', async (req, res) => {

    if (req.body.title !== '') {
        await taskMongoose(req.body).save()
        music.init(`Task ${req.body.title} created`)
    } 

    res.redirect('/tasks')
})

//Удаляем task через внешний скрипт 
app.delete('/tasks', async (req, res) => {
    if(req.body._id) {
        await taskMongoose.findByIdAndDelete(req.body)
        const tasksList = await taskMongoose.find(req.body).lean()

        if (tasksList.length <= 0 ) {
            res.send({status: 'ok'})
            music.init(`Task ${req.body._id} deleted`)

        } else {
            res.redirect('/tasks')
        }
    }
})
//Registration
app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body
    
    if(restBody.password === repassword) {
        const user = new userModel(restBody)
        await user.save()
        res.redirect('/auth')
    } else {
        res.redirect('/register?error=repass')
    }

    res.render('register')
})

//auth

app.get('/auth', (req, res) => {
    const { error } = req.query
    res.render('auth', { error })
})

app.post('/auth', passport.authenticate) 

app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/auth')
})

const init = () => {
    getNews()
    music.init(`Server stat in ${port}`)
}

app.listen(port, () => {
    init()
})