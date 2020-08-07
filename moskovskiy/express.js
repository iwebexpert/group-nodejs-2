const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const hbs = require('handlebars');

const request = require('request');
const cheerio = require('cheerio');

const app = express();

const taskMysql = require('./models/taskMySQL');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

hbs.registerHelper('if_eq', function (a, b, opts) {
    if (a === b) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});

app.get('/tasks', async (req, res) => {
    const tasks = await taskMysql.getAll();
    res.render('tasks', {tasks});
})

app.post('/priority/:id', async (req, res) => {
    if (req.body.priority && ['Low', 'Normal', 'High'].indexOf(req.body.priority) !== -1) {
        const status = taskMysql.changePriority(parseInt(req.params.id), req.body.priority)
        status.then(async (result) => {
            if (result && result.status === 'success') {
                res.redirect('/tasks')
            } else {
                res.json({error: 'Что-то пошло не так'})
            }
        })
    }
})

app.delete('/tasks/:id', async (req, res) => {

    const status = taskMysql.delete(parseInt(req.params.id))
    status.then(async (result) => {
        if (result && result.status === 'success') {
            res.json({status: 'success'})
        } else {
            res.json({error: 'Что-то пошло не так'})
        }
    })
})


app.get('/news', (req, res) => {
    res.render('form')
})

app.post('/news', (req, res) => {
    if (req.body.q && req.body.q > 0) {
        let newsQty = parseInt(req.body.q);
        request('https://yandex.ru/news/', (err, response, body) => {
            let list = [];
            if (!err && res.statusCode === 200) {
                const $ = cheerio.load(body);
                const news = $('.story');
                news.each(function (i, item) {
                    console.log(i, newsQty)
                    if (i === newsQty) {
                        return false
                    }
                    const topic = $(item).find('.story__topic');
                    const title = $(topic).find('a').text();
                    const info = $(item).find('.story__info');
                    const origin = $(info).find('.story__date').text();
                    list.push({
                        title,
                        origin,
                    });
                });
            }
            res.render('list', {list, newsQty})
        })

    } else {
        res.render('form')
    }
});

app.listen('4000', () => {
    console.log('The server is running on port 4000...')
});