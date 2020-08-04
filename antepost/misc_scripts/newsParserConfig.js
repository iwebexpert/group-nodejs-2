const config = {
    'iz.ru': {
        urlToParse: 'https://iz.ru',
        parseFunc: $ => {
            const newsArr = [];
            $('.short-last-news__inside__list__items').find('li').each((i, el) => {
                newsArr[i] = {
                    headline: $(el).find('.short-last-news__inside__list__item__label').text().trim(),
                    link: config['iz.ru'].urlToParse + $(el).find('a').attr('href'),
                    time: $(el).find('time').text(),
                };
            });
            return newsArr;
        },
    },
    'rbc.ru': {
        urlToParse: 'https://rbc.ru/',
        parseFunc: $ => {
            const newsArr = [];
            $('.js-news-feed-list').find('.news-feed__item').each((i, el) => {
                newsArr[i] = {
                    headline: $(el).find('.news-feed__item__title').text().trim(),
                    link: $(el).attr('href'),
                    time: $(el).find('.news-feed__item__date-text').text().match(/\d{2}:\d{2}/g)[0],
                }
            });
            return newsArr;
        }
    }
};

const possibleWebsitesToParse = Object.keys(config);

module.exports = {
    config,
    possibleWebsitesToParse,
};
