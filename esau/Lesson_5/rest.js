const express = require('express');
const consolidate = require('consolidate');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const newsModel = require('./models/news');
const userModel = require('./models/user');

const SECRET = 'fdslkfj897834urjpifkmj048uomimf90!!#320kpodk3*9358lcj3!(*&%vfyu';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, 'views'));

const authorization = (req, res, next) => {
    if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');

        jwt.verify(token, SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send();
            }

            req.user = decoded;
            next();
        });
    } else {
        return res.status(403).send();
    }
};

app.use('/news', authorization);

app.get('/news', async (req, res) => {
    const news = await newsModel.getAll();
    res.status(200).json(news);
})

app.get('/news/:id', async (req, res) => {
    const {id} = req.params;
    const news = await newsModel.getById(id);
    res.status(200).json(news);
})

app.post('/news', async (req, res) => {
    const id = await newsModel.add(req.body);
    res.status(200).json(id);
})

app.put('/news/:id', async (req, res) => {
    const id = await newsModel.update(req.params.id, req.body);
    res.status(200).json(id);
})

app.delete('/news/:id', async (req, res) => {
    const affectedRows = await newsModel.delete(req.params.id);
    res.status(200).json(affectedRows);
})

app.post('/signup', async (req, res) => {
    const {repass, ...restBody} = req.body;
    const model = new userModel();
    const user = await model.findOne({login: restBody.login});

    if (user) {
        return res.status(400).json({message: 'User exists!'});
    }

    if (restBody.password === repass) {
        const model = new userModel();

        await model.add(restBody);
        res.status(201).send();
    } else {
        res.status(400).json({message: 'Password and Re-Password not equal!'});
    }
})

app.post('/signin', async (req, res) => {
    const {login, password} = req.body;

    const model = new userModel();
    const user = await model.findOne({login});

    if (!user) {
        return res.status(401).send();
    }

    if (!model.validatePassword(password, user.password)) {
        return res.status(401).send();
    }

    delete user.password;

    res.status(200).json({
        user,
        token: jwt.sign(user, SECRET)
    })
});

app.listen(8080, () => {
    console.log('Server has been started on localhost:8080');
});