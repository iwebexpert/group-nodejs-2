const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const taskRouter = require('./routes/task')
const userRouter = require('./routes/user')

const app = express()
const port = 3000
const DB_PORT = 27017
const SECRET = '$uper$ecret$tring'

app.use(express.json())
app.use(cors())

const checkAuth = (req, res, next) => {
    if (req.headers.authorization) {
        const [type, token] = req.headers.authorization.split(' ')
        jwt.verify(token, SECRET, (error, decoded) => {
            if (error) {
                return res.status(403).send()
            }
            req.user = decoded
            next()
        })
    } else {
        return res.status(403).send()
    }
}

app.use('/tasks', checkAuth)

app.use('/tasks', taskRouter)
app.use('/', userRouter)

mongoose
    .connect(`mongodb://localhost:${DB_PORT}/todo`, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false 
    })
    .then(() => console.log("Mongodb connected"))
    .catch(error => {
        console.error('Connection error', error.message)
    })

const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.listen(port, () => console.log(`Server running on port ${port}`))