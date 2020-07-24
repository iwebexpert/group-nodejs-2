const request = require('request');
const cheerio = require('cheerio');

const config = {
    urlToParse: 'https://iz.ru',
    parseFunc: $ => {
        const newsArr = [];
        $('.short-last-news__inside__list__items').find('li').each((i, el) => {
            newsArr[i] = [
                $(el).find('.short-last-news__inside__list__item__label').text().trim(),
                $(el).find('a').attr('href'),
                $(el).find('time').text(),
            ];
        });
        return newsArr;
    },
    displayFunc: el => {
        const newsItem = `${el[0]}\nLink: '${config.urlToParse + el[1]}'\nAt: ${el[2]}\n`;
        console.log(newsItem);
    },
};

const parseNews = (urlToParse, parseFunc, displayFunc) => {
    request(urlToParse, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const $ = cheerio.load(body);
            const newsArr = parseFunc($);

            console.log(`Top ${newsArr.length} latest news from ${urlToParse}:`);
            newsArr.forEach(displayFunc);
        }
    });
};

parseNews(...Object.values(config));
