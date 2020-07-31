const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
var cookie = require('cookie')

const Parser = require('rss-parser')
const parser = new Parser()

const app = express()

const allCounts = [
    { name: 8, target: false },
    { name: 6, target: false },
    { name: 4, target: false }
]

const allCategories = [
    { name: 'internet', target: false },
    { name: 'games', target: false },
    { name: 'sport', target: false }
]

defaultCount = allCounts[0]
defaultCategory = allCategories[0]

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))

//Middleware для работы с form
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

async function getNewsFromSrc(count, category) {
    let feed = await parser.parseURL(`https://news.yandex.ru/${category.name}.rss`)
    feed.items = feed.items.slice(0, count.count)
    return feed
}

function setTarget(allElems, value) {
    for (let elem of allElems) {
        if (String(elem.name) === String(value)) elem.target = true
        else elem.target = false
    }
}

app.get('/', (req, res) => {
    let cookies = cookie.parse(req.headers.cookie || '')
    let newsCount = defaultCount
    let newsCategory = defaultCategory

    if (cookies.countAndCategory) {
        const newsData = JSON.parse(cookies.countAndCategory)
        newsCount = newsData.count
        newsCategory = newsData.category
    }

    getNewsFromSrc(newsCount, newsCategory)
        .then(data => {
            res.render('news', { news: data, allCounts, allCategories })
        })
})

app.post('/options', (req, res) => {
    let { category, count } = req.body
    if (req.body && category && count) {
        res.setHeader('Set-Cookie', cookie.serialize('countAndCategory', String(JSON.stringify({ count: { count: count }, category: { name: category } }))), {
            maxAge: 60 * 60 * 24
        })

        setTarget(allCounts, count)
        setTarget(allCategories, category)

        res.redirect('/')
    }
})

app.listen(4000, () => {
    console.log('Server started on http://localhost:4000')
})