/**
 * Created by ankho on 27.07.2020.
 */

const request = require('request')
const cheerio = require('cheerio')

request('http://www.19rus.info/index.php/vse-novosti-dnya', (err, res, body) => {
    if(!err && res.statusCode === 200){

        const $ = cheerio.load(body)

        const firstNews = $('.allmode-topitem').find('.allmode-title').eq(0).text()
        console.log(firstNews)

        $('.allmode-topitem').each(function(i, elem) {
            const title = $(this).find('.allmode-title').text()
            const link = $(this).find('.allmode-title a').attr('href')

            console.log(title)
            console.log(link)
            console.log('===============================')
        })

    }

})