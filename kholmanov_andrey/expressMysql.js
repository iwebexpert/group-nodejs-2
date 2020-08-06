/**
 * Created by ankho on 27.07.2020.
 */
const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const request = require('request')
const cheerio = require('cheerio')
var cookieParser = require('cookie-parser')

const app = express()

const taskMysql = require('./models/taskMysql')

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

// Middleware для работы с куками
app.use(cookieParser())

//Middleware для работы с form
app.use(express.urlencoded({extended: false}))

//Для работы с JSON
app.use(express.json())

app.get('/tasks', async (req, res) => {
    const tasks = await taskMysql.getAll()
    res.json(tasks)
})

app.listen(4000, () => {
    console.log('The server has been started!')
})