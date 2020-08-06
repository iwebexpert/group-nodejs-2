require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const Task = require('./models/TaskMongo');
const User = require('./models/UserMongo');

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors());

const checkAuth = (req, res, next) => {
    if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ');

        jwt.verify(token, process.env.BEARER_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send();
            }

            req.user = decoded;
            next();
        })
    } else {
        return res.status(403).send();
    }
};

app.use('/tasks', checkAuth);

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find({}).lean();
    res.status(200).json(tasks);
});

app.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    const createdTask = await task.save();
    if (createdTask) {
        res.status(200).json(createdTask);
    } else {
        res.sendStatus(500);
    }
});

app.get('/tasks/:id', async (req, res) => {
    const task = await Task.findById(req.params.id).lean();
    res.status(200).json(task);
});

app.patch('/tasks/:id', async (req, res) => {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.status(200).json(updatedTask);
});

app.delete('/tasks/:id', async (req, res) => {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    console.log(deletedTask)
    if (deletedTask) {
        res.sendStatus(204);
    } else {
        res.sendStatus(500);
    }
});

app.post('/register', async (req, res) => {
    const { repassword, ...restBody } = req.body;
    if (restBody.password === repassword) {
        const user = new User(restBody);
        await user.save();
        res.status(201).send({ message: 'User has been registered successfully' });
    } else {
        res.status(400).json({ message: 'Passwords didn\'t match' });
    }
});

app.post('/auth', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).send();
    }

    if (!user.validatePassword(password)) {
        return res.status(401).send();
    }

    const plainUser = JSON.parse(JSON.stringify(user));
    delete plainUser.password;

    res.status(200).json({
        ...plainUser,
        token: jwt.sign(plainUser, process.env.BEARER_TOKEN_SECRET),
    });
});

app.listen(4000, () => {
    console.log('The server has been started on port 4000!');
});
