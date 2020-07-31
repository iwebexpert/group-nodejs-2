const express = require('express')
const mongoose = require('mongoose')
const handlebars = require('express-handlebars')
const path = require('path')

const taskRouter = require('./routes/task')

const app = express()
const port = 3000

app.engine('hbs', handlebars({defaultLayout: 'layout'}))
app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.resolve(__dirname, 'styles')))
app.use(express.urlencoded({ extended: true }))

app.use('/', taskRouter)

mongoose
    .connect('mongodb://localhost:27017/todo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Mongodb connected"))
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.listen(port, () => console.log(`Server running on port ${port}`))