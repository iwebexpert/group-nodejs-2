const request = require('request');
const cheerio = require('cheerio');

module.exports = request('https://time.com/section/newsfeed/', (err, res, body) => {
    if (!err && res.statusCode === 200) {
        const $ = cheerio.load(body);
      $('.partial.tile.media.image-top.type-article').each(function (index, item){
          console.log(`Заголовок: ${$(item).find('h3.headline>a').text()}\r\n`,`Содержимое: ${$(this).find('.summary.margin-8-bottom.desktop-only').text()}\r\n`,`################################################\r\n`);
      });
    }
})
