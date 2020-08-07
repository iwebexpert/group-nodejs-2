const Parser = require('rss-parser');
const parser = new Parser();
const colors = require('colors');

(async() => {
    let feed = await parser.parseURL('https://news.yandex.ru/internet.rss');
    console.log(feed.title);

    feed.items.forEach(item => {
        console.log('\n')
        console.log(item.title.bgBlue)
        console.log(item.content.green)
        console.log(item.pubDate.gray)
    });
})();