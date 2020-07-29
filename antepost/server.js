const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookie = require('cookie');

const newsParser = require('./misc_scripts/newsParserForServer');
const { possibleWebsitesToParse } = require('./misc_scripts/newsParserConfig');

const app = express();

// Static files
app.use(express.static('public'));

// Adding templating engine
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
    res.render('home', { title: 'News aggregation website', possibleWebsitesToParse });
});

app.post('/settings', (req, res) => {
    res.cookie('websiteToParse', req.body.website);
    res.cookie('newsItemsNumber', req.body['items-number']);
    res.redirect('/news');
});

app.get('/news', async (req, res, next) => {
    let { websiteToParse, newsItemsNumber } = cookie.parse(req.headers.cookie || '');
    if (!websiteToParse || !newsItemsNumber) {
        res.render('news', { noCookie: true, title: 'Server error', possibleWebsitesToParse });
        return;
    }

    let newsArr;
    try {
        newsArr = await newsParser(websiteToParse);
    } catch (err) {
        res.sendStatus(500);
        return next(err);
    }

    if (newsArr) {
        newsArr = newsArr.slice(0, newsItemsNumber);
    }

    if (newsArr.length < newsItemsNumber) {
        newsItemsNumber = newsArr.length;
    }
    res.render('news', { newsArr, newsItemsNumber, websiteToParse, title: `News from ${websiteToParse}`, possibleWebsitesToParse });
});

app.listen(4000, () => {
    console.log('The server has been started!');
});
