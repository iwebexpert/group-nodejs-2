/**
 * Created by ankho on 27.07.2020.
 */

const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const request = require('request')
const cheerio = require('cheerio')

const app = express()

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

//Middleware для работы с form
app.use(express.urlencoded({extended: false}))

//Для работы с JSON
app.use(express.json())

app.get('/', (req, res) => {
    request('http://www.19rus.info/index.php/vse-novosti-dnya', (err, response, body) => {
        if(!err && response.statusCode === 200){
            const $ = cheerio.load(body)
            const news = []

            $('.allmode-topitem').each(function(i, elem) {
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
            })
        }
    })
})

app.post('/', (req, res) => {
    request('http://www.19rus.info/index.php/vse-novosti-dnya', (err, response, body) => {
        if(!err && response.statusCode === 200){
            const $ = cheerio.load(body)
            const news = []

            $('.allmode-topitem').each(function(i, elem) {
                if (i >= +req.body.param1) {
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
            })
        }
    })
})

app.listen(4000, () => {
    console.log('The server has been started!')
})