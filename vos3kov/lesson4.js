const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const request = require('request')
const cheerio = require('cheerio')
const cookie = require('cookie')
const url = require('url')

const app = express()

const news = []
let count = 10


app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))


app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use((req, res, next) => {
    let cookies = cookie.parse(req.headers.cookie || '')
    if (cookies.count) {
        count = cookies.count
    }

    let query = url.parse(req.url, true, true).query
    if (query && query.count) {
        res.setHeader(
            'Set-Cookie',
            cookie.serialize('count', String(query.count), {
                maxAge : 60
            }))
        count = query.count
    }
    next()
})

app.get('/', (req, response) => {
    request('https://yandex.ru/', (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(body)
            $('.news__item-content').each((i, elem) => {
                news[i] = $('.news__item-content').eq(i).text()
            })

            const renderNews = news.slice(0, count)
            response.render('news',  {renderNews, count} )
        }
    })
})

app.post('/settings', (req, res) => {
    count = req.body.count ? (req.body.count >10 ? 10 : req.body.count) : 10
    res.setHeader(
        'Set-Cookie',
        cookie.serialize('count', String(req.body.count), {
            maxAge : 60
        }))
    res.redirect('/')
})

app.listen(4000, () => {
    console.log('The server has been started!')
})