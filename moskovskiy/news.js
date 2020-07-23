const request = require('request');
const cheerio = require('cheerio');
const chalk = require('chalk');

request('https://yandex.ru/news/', (err, res, body) => {
    if (!err && res.statusCode === 200) {
        const $ = cheerio.load(body);
        const news = $('.story');
        news.each(function (i, item) {
            const topic = $(item).find('.story__topic');
            const title = $(topic).find('a').text();
            const info = $(item).find('.story__info');
            const origin = $(info).find('.story__date').text();
            console.log('#########################################################')
            console.log(chalk.bold(title));
            console.log('Источник:', chalk.red(origin));
        });
    }
});