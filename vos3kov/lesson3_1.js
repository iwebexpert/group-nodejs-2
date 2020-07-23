const request = require('request')
const cheerio = require('cheerio')

request('https://yandex.ru/', (err, res, body) => {
    if (!err && res.statusCode === 200) {
        const $ = cheerio.load(body)

        const news = []
        $('.news__item-content').each((i, elem) => {
            news[i] = $('.news__item-content').eq(i).text()
        })
        console.log(news)
    }
})
