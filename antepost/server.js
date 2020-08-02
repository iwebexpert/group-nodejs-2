const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookie = require('cookie');
const methodOverride = require('method-override');

const newsParser = require('./misc_scripts/newsParserForServer');
const { possibleWebsitesToParse } = require('./misc_scripts/newsParserConfig');

const establishMongoConnection = require('./db_utilities/mongoConnection');
const establishMysqlConnection = require('./db_utilities/mysqlConnection');
const performMysqlQuery = require('./db_utilities/mysqlQuery');
const loggingMiddleware = require('./db_utilities/mysqlLoggingMiddleware');

const Task = require('./models/TaskMongo');

// Connect to DBs
let mysqlPool;
establishMongoConnection()
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
    });

const app = express();

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
app.use((req, res, next) => {
    loggingMiddleware({
        newDocument: res.createdTask ? res.createdTask : res.originalTask,
        oldDocument: res.deletedTask ? res.deletedTask : res.updatedTask,
        isCreated: Boolean(res.createdTask),
        isDeleted: Boolean(res.deletedTask),
    }, mysqlPool);
});
