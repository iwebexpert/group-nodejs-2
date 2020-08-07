const express = require('express');
const consolidate = require('consolidate');
const request = require('request');
const cheerio = require('cheerio');
const path = require('path');

const url = 'https://news.yandex.ru/';

const app = express();

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/news', (req, response) => {
    let news = [];

    request(url + req.body.category + '.rss', (err, res, body) => {
        if(!err && res.statusCode === 200){
            const $ = cheerio.load(body);

            let items = $('item');
            if (req.body.count) {
                items = items.slice(0, req.body.count);
            }

            items.each(function(i, elem) {
                const title = $(this).find('title').text();
                const pubDate = $(this).find('pubDate').text();
                const description = $(this).find('description').text();
                const dateObj = new Date(pubDate);

                const day = ("0" + dateObj.getDate()).slice(-2);
                const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
                const year = dateObj.getFullYear();

                news.push({
                    title,
                    description,
                    date: `${day}.${month}.${year}`
                });
            });

            response.render('index', {news});
        }
    });
});

app.listen(8080, () => {
    console.log('Server started on localhost:8080')
});