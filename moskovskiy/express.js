const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const hbs = require('handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('./auth');


const app = express();

mongoose.connect('mongodb://localhost:27017/node', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: 'dfkjdflk;jdsf;lajdfl;kjsdf',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

app.use(passport.initialize);
app.use(passport.session)
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

app.use('/', require('./routes'))

app.listen('4000', () => {
    console.log('The server is running on port 4000...')
});