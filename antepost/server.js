require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookie = require('cookie');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const newsParser = require('./misc_scripts/newsParserForServer');
const { possibleWebsitesToParse } = require('./misc_scripts/newsParserConfig');

const establishMongoConnection = require('./db_utilities/mongoConnection');
const establishMysqlConnection = require('./db_utilities/mysqlConnection');
const performMysqlQuery = require('./db_utilities/mysqlQuery');
const loggingMiddleware = require('./db_utilities/mysqlLoggingMiddleware');

const Task = require('./models/TaskMongo');
const User = require('./models/UserMongo');
const passport = require('./auth');

const mongoose = require('mongoose');

const app = express();

// Connect to DBs
let mysqlPool;
/* establishMongoConnection()
    .then(res => {
        app.use(session({
            resave: true,
            saveUninitialized: false,
            secret: '1234',
            store: new MongoStore({ mongooseConnection: res }),
        }));
        app.use(passport.initialize);
        app.use(passport.session);
    })
    .then(res => {
        return establishMysqlConnection();
    })
    .then(res => {
        mysqlPool = res;
        app.listen(4000, () => {
            console.log('The server has been started on port 4000!');
        });
    })
    .catch(err => {
        throw err;
    }); */

mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

app.use(session({
    resave: true,
    saveUninitialized: false,
    secret: '1234',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
}));
app.use(passport.initialize);
app.use(passport.session);

// Static files
app.use(express.static('public'));

// Adding templating engine
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', path.resolve(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));

app.use(methodOverride((req, res, next) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.use('/tasks', passport.mustBeAutheticated);

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

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find({}).lean();
    res.render('tasks', { tasks, method: 'post' });
});

app.post('/tasks', async (req, res, next) => {
    const task = new Task(req.body);
    const createdTask = await task.save();
    if (createdTask) {
        res.redirect(`/tasks/${createdTask._id}`);
        res.createdTask = createdTask;
    }
    next();
});

app.get('/tasks/history', async (req, res) => {
    let tasksHistory = await performMysqlQuery('SELECT * FROM tasks_history;', mysqlPool);
    tasksHistory = tasksHistory.map(el => {
        el.change_date = el.change_date.split(/[T\.]/).slice(0, -1).join(' ');
        return el;
    });
    const uniqueDocumentsId = tasksHistory.reduce((acc, cur) => {
        if (acc.includes(cur.changed_document_id)) {
            return acc;
        }
        acc.push(cur.changed_document_id);
        return acc;
    }, []);
    res.render('task_history', { tasksHistory, uniqueDocumentsId });
})

app.delete('/tasks/history', async (req, res) => {
    const result = await performMysqlQuery('TRUNCATE TABLE tasks_history;', mysqlPool);
    if (result) {
        res.json({ status: "Success", redirect: '/tasks/history' });
    }
})

app.get('/tasks/:id', async (req, res) => {
    const task = await Task.findById(req.params.id).lean();
    res.render('task', { ...task, actionAddition: req.params.id, method: 'put' });
});

app.put('/tasks/:id', async (req, res, next) => {
    const originalTask = await Task.findById(req.params.id).lean();
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.render('task', { ...updatedTask, actionAddition: req.params.id, method: 'put' });
    res.originalTask = originalTask;
    res.updatedTask = updatedTask;
    next();
});

app.delete('/tasks/:id', async (req, res, next) => {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (deletedTask) {
        res.json({ status: "Success", redirect: '/tasks' });
        res.deletedTask = deletedTask;
    }
    next();
});

// MySQL logging middleware
app.use('/tasks/:id', (req, res, next) => {
    loggingMiddleware({
        newDocument: res.createdTask ? res.createdTask : res.originalTask,
        oldDocument: res.deletedTask ? res.deletedTask : res.updatedTask,
        isCreated: Boolean(res.createdTask),
        isDeleted: Boolean(res.deletedTask),
    }, mysqlPool);
});

//Registration/Auth
app.get('/register', (req, res) => {
    let { err } = req.query;
    if (err === 'wrong-email') {
        err = 'User with that email already registered';
    } else if (err === 'wrong-repass') {
        err = 'Password and repeated password do not match';
    }
    res.render('register', { err });
})

app.post('/register', async (req, res) => {
    const { repassword, ...restBody } = req.body;
    if (restBody.password === repassword) {
        const user = new User(restBody);
        const success = await user.save(err => {
            if (err.name === 'MongoError' && err.code === 11000) {
                res.redirect('/register?err=wrong-email');
            }
        });
        if (success) {
            res.redirect('/auth');
        }
    } else {
        res.redirect('/register?err=wrong-repass');
    }
});

app.get('/auth', (req, res) => {
    const { err } = req.query;
    res.render('auth', { err });
});

app.post('/auth', passport.authenticate);

app.get('/logout', (req, res) => {
    delete app.locals.email;
    req.logout();
    res.redirect('/auth');
});

establishMysqlConnection()
    .then(res => {
        mysqlPool = res;
        app.listen(4000, () => {
            console.log('The server has been started on port 4000!');
        });
    })
    .catch(err => {
        throw err;
    });
