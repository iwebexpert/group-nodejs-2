const express = require('express')
const cors = require('cors') //TODO
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const socketIO = require('socket.io')
const http = require('http')
const path = require('path')

const SECRET_KEY = 'fjhgdsjfhgduitgfuiytruyewfdsdsfh231445'

mongoose.connect('mongodb://localhost:27017/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const taskModel = require('./models/task')
const userModel = require('./models/user')
const passport = require('./auth')

const app = express()

//Создаем сервер
const server = http.Server(app)
const io = socketIO(server)

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())

//Middleware для авторизации
const checkAuth = (req, res, next) => {
    if(req.headers.authorization){
        const [type, token] = req.headers.authorization.split(' ')

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if(err){
                return res.status(403).send()
            }

            //Расшифровываем token
            req.user = decoded;
            next()
        })
    } else {
        return res.status(403).send()
    }
}

app.use('/tasks', checkAuth)

//Для клиентской части
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'))
})

app.get('/auth', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'auth.html'))
})

//Методы для обработки запросов
app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find({}).lean()
    res.status(200).json(tasks)
})

app.post('/tasks', async (req, res) => {
    const task = new taskModel(req.body)
    const isSaved = await task.save()
    //res.json(isSaved)

    res.status(200).json(isSaved)
})

app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params
    const task = await taskModel.findById(id)
    res.status(200).json(task)
})

//TODO
app.delete('/tasks', async (req, res) => {
    const { id } = req.body
    await taskModel.findByIdAndRemove(id)
    res.status(200).send()
})

app.patch('/tasks', async (req, res) => {
    const { id, title, completed } = req.body
    const task = await taskModel.findById( id )

    const updatedTask = {
        title: title ? title : task.title,
        completed: completed ? completed : false,
    }

    taskModel.updateOne({_id: id}, updatedTask, {new: true}, function(err, task){
        if(err) return res.status(400).json({message: 'the task is not updated!'})
    })

    res.status(200).send()
})

//Для авторизации и регистрации
app.post('/register', async (req, res) => {
    const { repassword, ...restBody } = req.body
    if(restBody.password === repassword){
        const user = new userModel(restBody)
        await user.save()
        res.status(201).send()
    } else {
        res.status(400).json({message: 'User exists!'})
    }
})

app.post('/auth', async (req, res) => {
    const { email, password } = req.body

    const user = await userModel.findOne({email})

    if(!user){
        return res.status(401).send()
    }

    if(!user.validatePassword(password)){
        return res.status(401).send()
    }

    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password

    res.status(200).json({
        ...plainUser,
        token: jwt.sign(plainUser, SECRET_KEY),
    })
})

io.on('connection', (socket) => {
    console.log('New connection!')

    socket.on('create', async (data) => {
        console.log('create event')
        const task = new taskModel(data)
        const savedTask = await task.save()

        socket.broadcast.emit(`created`, savedTask) //all, кроме нас
        socket.emit(`created`, savedTask) //Только для 1 соединения
    })

    socket.on('toggle', async (taskId) => {
        console.log('toggle event')
        const task = await taskModel.findById(taskId)
        await taskModel.findOneAndUpdate({_id: taskId}, {$set: {completed: !task.completed}})

        socket.broadcast.emit(`toggled`, taskId) //all, кроме нас
        socket.emit(`toggled`, taskId) //Только для 1 соединения
    })

    socket.on('disconnect', () => {
        console.log('Client has disconnected!')
    })
})

// app.listen(4000, () => {
//     console.log('The server has been started!')
// })

server.listen(4000, () => {
    console.log('The server has been started!')
})