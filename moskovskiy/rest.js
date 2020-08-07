const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const consolidate = require('consolidate');
const path = require('path');
const hbs = require('handlebars');

mongoose.connect('mongodb://localhost:27017/node', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const User = require('./models/user');
const passport = require('./auth');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());

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


app.use('/', require('./apiRoutes'))

app.listen('4000', () => {
    console.log('The server is running on port 4000...')
});