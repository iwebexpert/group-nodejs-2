const express = require('express');
const consolidate = require('consolidate');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const cookie = require('cookie');

const newsParser = require('./misc_scripts/newsParserForServer');
const { possibleWebsitesToParse } = require('./misc_scripts/newsParserConfig');

const app = express();

// As per https://github.com/tj/consolidate.js#template-engine-instances
consolidate.requires.handlebars = handlebars;

// Registering partials
// As per https://gist.github.com/jaksah/70fc400ce70664eaa47fcb47c34b307c
const partialsDir = path.resolve(__dirname, 'views', 'partials');
const filenames = fs.readdirSync(partialsDir);

filenames.forEach(filename => {
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
        return;
    }

    const name = matches[1];
    const template = fs.readFileSync(path.join(partialsDir, filename), 'utf8');
    consolidate.requires.handlebars.registerPartial(name, template);
});

// Adding templating engine
app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req, res) => {
    res.render('home', { possibleWebsitesToParse });
});

app.post('/settings', (req, res) => {
    res.cookie('websiteToParse', req.body.website);
    res.cookie('newsItemsNumber', req.body['items-number']);
    res.redirect('/news');
});

app.get('/news', async (req, res, next) => {
    let { websiteToParse, newsItemsNumber } = cookie.parse(req.headers.cookie || '');
    if (!websiteToParse || !newsItemsNumber) {
        res.render('news', { noCookie: true, possibleWebsitesToParse });
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
    res.render('news', { newsArr, newsItemsNumber, websiteToParse, possibleWebsitesToParse });
});

app.listen(4000, () => {
    console.log('The server has been started!');
});
