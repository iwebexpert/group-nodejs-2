const request = require('request')
const cheerio = require('cheerio')
const chalk = require('chalk')

request('https://news.yandex.ru/auto.rss', (err, res, body) => {
    if(!err && res.statusCode === 200){
        const $ = cheerio.load(body)

        const news = $('item')

        news.each(function(i, elem) {
            const title = $(this).find('title').text()
            const pubDate = $(this).find('pubDate').text()
            const dateObj = new Date(pubDate)

            const day = ("0" + dateObj.getDay()).slice(-2)
            const month = ("0" + (dateObj.getMonth() + 1)).slice(-2)
            const year = dateObj.getFullYear()

            console.log(chalk.underline(`Дата: ${day}.${month}.${year}`), `\n${chalk.bold('Заголовок:')} ${title}\n`)
        })

    }
})