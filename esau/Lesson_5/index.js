const express = require('express');
const consolidate = require('consolidate');
const multer  = require('multer');
const forms = multer();
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');

const newsModel = require('./models/news');
const userModel = require('./models/user');
const passport = require('./authorization');

const config = require('./config');

const pool = mysql.createPool({
    ...config,
    connectionLimit: 3,
    waitForConnections: true
});

const app = express();

app.use(express.json());
app.use(forms.array());
app.use(express.urlencoded({extended: false}));

app.use(session({
    key: 'session_key',
    secret: 'abrkadabra',
    createDatabaseTable: true,
    store: new MySQLStore({
        schema: {
            tableName: 'sessions',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }
    }, pool),
    resave: false,
    clearExpired: true,
    saveUninitialized: false
}));

app.use(passport.initialize);
app.use(passport.session);

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

app.use('/news', passport.mustBeAuthenticated);

app.get('/', async (req, res) => {
    res.render('index');
})

app.get('/news', async (req, res) => {
    const news = await newsModel.getAll();
    res.render('news', {news});
})

app.post('/news', async (req, res) => {
    const id = await newsModel.add(req.body);
    res.json(id);
})

app.put('/news/:id', async (req, res) => {
    const id = await newsModel.update(req.params.id, req.body);
    res.json(id);
})

app.delete('/news/:id', async (req, res) => {
    const affectedRows = await newsModel.delete(req.params.id);
    res.json(affectedRows);
})

app.get('/signup', async (req, res) => {
    const {error} = req.query;
    res.render('signup', {error});
})

app.post('/signup', async (req, res) => {
    const {repass, ...restBody} = req.body;

    if (restBody.password === repass) {
        const model = new userModel();

        await model.add(restBody);
        res.redirect('/signin');
    } else {
        res.redirect('/signup?error=1');
    }
})

app.get('/signin', (req, res) => {
    const {error} = req.query;
    res.render('signin', {error});
})

app.post('/signin', passport.authenticate, (req, res) => {
    res.redirect('/news');
});

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            throw err;
        }
    })
    res.redirect('/signin');
})

app.listen(8080, () => {
    console.log('Server has been started on localhost:8080');
});