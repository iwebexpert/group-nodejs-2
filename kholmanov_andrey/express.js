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

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

// Middleware для работы с куками
app.use(cookieParser())

//Middleware для работы с form
app.use(express.urlencoded({extended: false}))

//Для работы с JSON
app.use(express.json())

app.get('/', (req, res) => {

    console.log('Cookie: ', req.cookies);

    request('http://www.19rus.info/index.php/vse-novosti-dnya', (err, response, body) => {
        if(!err && response.statusCode === 200){
            const $ = cheerio.load(body)
            const news = []

            // по умолчанию 0
            let count = 10

            if (req.cookies.count) {
                count = +req.cookies.count
            }

            $('.allmode-topitem').each(function(i, elem) {

                if (i >= count) {
                    return
                }

                const title = $(this).find('.allmode-title').text()
                const link = $(this).find('.allmode-title a').attr('href')

                news[i] = {
                    title: title,
                    link: link
                }
            })

            // console.log(news[0].title)
            res.render('news', {
                news,
                count: req.cookies.count
            })
        }
    })
})

app.post('/', (req, res) => {
    request('http://www.19rus.info/index.php/vse-novosti-dnya', (err, response, body) => {
        if(!err && response.statusCode === 200){
            const $ = cheerio.load(body)
            const news = []
            const count = req.body.param1

            // устанавливаем куки
            res.cookie('count', count);

            $('.allmode-topitem').each(function(i, elem) {
                if (i >= count) {
                    return
                }
                const title = $(this).find('.allmode-title').text()
                const link = $(this).find('.allmode-title a').attr('href')

                news[i] = {
                    title: title,
                    link: link
                }
            })

            // console.log(news[0].title)
            res.render('news', {
                news,
                count: count
            })
        }
    })
})

app.listen(4000, () => {
    console.log('The server has been started!')
})