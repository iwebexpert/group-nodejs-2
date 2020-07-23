const request = require('request')
const cheerio = require('cheerio')
const color = require('colors')

request('https://habr.com', (err, res, body) => {
    
    if (!err && res.statusCode === 200) {
        const $ = cheerio.load(body)

        $('div[class="posts_list"]').find('a[class="post__title_link"]').each((idx, elem) => {
            const title = $(elem).text()
            const link = $(elem).attr('href')
            console.log(title.bold.bgBlue, "\n", link.underline)
            console.log('------------------------------')
        })
    }
})