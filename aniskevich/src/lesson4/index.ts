const express = require('express')
const consolidate = require('consolidate')
const path = require('path')
const cookieParser = require('cookie-parser')

const newsParser = require('./newsParser')

const PORT = 3000
const app = express()

app.engine('hbs', consolidate.handlebars)
app.set('view engine', 'hbs')
app.set('views', path.resolve(__dirname, 'views'))
app.use(express.static(path.resolve(__dirname, 'styles')))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.post('/news', (req: any, res: any) => {
    const options: any = {
        title: 'off',
        body: 'off',
        image: 'off',
        count: 0
    }
    for (const cook in req.body) {
        options[cook] = req.body[cook]
    }
    for (const key of Object.keys(options)) {
        res.cookie(key, options[key])
    }
    res.redirect('/')
})

app.get('/', (req: any, res: any) => {
    if (!(Object.keys(req.cookies).length)) {
        res.render('news')
    } else {
        const parser = new newsParser('https://newsvl.ru')
        parser.parse().then(() => {
            const news = parser.getData(req.cookies)
            Object.keys(req.cookies).map(key => {
                if (req.cookies[key] === 'off') delete req.cookies[key]
            })
            res.render('news', {news, options: req.cookies})
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})