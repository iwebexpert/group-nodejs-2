const express = require('express');

const newsModel = require('./models/news');

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const news = {
    title: 'Title',
    description: 'Description',
    date: '30.07.2020'
};

app.get('/news', async (req, res) => {
    const news = await newsModel.getAll();
    res.json(news);
})

app.post('/news', async (req, res) => {
    const id = await newsModel.add(news);
    res.json(id);
})

app.put('/news/:id', async (req, res) => {
    const id = await newsModel.update(req.params.id, news);
    res.json(id);
})

app.delete('/news/:id', async (req, res) => {
    const id = await newsModel.delete(req.params.id);
    res.json(id);
})

app.listen(8080, () => {
    console.log('Server has been started on localhost:8080');
});