const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const config = require('./config')
const socketIO = require('socket.io')
const http = require('http')

const SECRET = "XCvRTKVxa9km4HEtH9f2Jv88W7uj4MHF4zFpJqTVjYdCwFA7p9"

mongoose.connect(`mongodb://${config.mongo}/GB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const taskModel = require('./src/models/taskMongo')
const userModel = require('./src/models/user')
const passport = require('./auth')
const { json } = require('express')

const app = express()

const server = http.Server(app)
const io = socketIO(server)

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

const checkAuth = (req, res, next) => {
    if(req.headers.authorization){
        const [type, token] = req.headers.authorization.split(' ')

        jwt.verify(token, SECRET, (error, decoded) => {
            if(error){
                return res.status(403).send()
            }
            req.user = decoded
            next()
        })
    } else {
        return res.status(403).send()
    }
}

io.on('connection', (socket) => {
    console.log('new client connection!')
    //login
    socket.on('login', async (data) => {
        const { email, password } = data
        const user = await userModel.findOne({ email })
        
        if(!user) {
            socket.emit('checkLogin', { login: email, error: true, text: 'user not exist' })
        }
        if(!user.validatePassword(password)) {
           await socket.emit('checkLogin', { login: email, error: true, error: 'passowrd is wrong' })
        }
        const plainUser = JSON.parse(JSON.stringify(user))
        delete plainUser.password

        socket.emit('checkLogin', {
            ...plainUser,
            token: jwt.sign(plainUser, SECRET)
        })
    })
    //create
    socket.on('createTask', async(data) => {
        const task = new taskModel(data)
        const isSaved = await task.save()
        
        io.sockets.emit('cbCreateTask', isSaved)
    })
    //delete
    socket.on('deleteTask', async(data) => {
        const id = data
        const targetTask = await taskModel.findById(id)
        if(targetTask) {
            await taskModel.deleteOne(targetTask)
            socket.emit('cbDeleteTask', { id, message: `удалена`, error: false })
        } else {
            socket.emit('cbDeleteTask', { id, message: `не найдена`, error: true })
        }
    })
    //modify
    socket.on('modifyTask', async(data) => {
        const { id, title, complited } = data
        const targetTask = await taskModel.findById(id)

        if(targetTask) {
            await taskModel.updateOne({ _id: id }, { $set: { title, complited } })
            socket.emit('cbModifyTask', { id, message: `task is updated`, error: false })
        } else {
            socket.emit('cbModifyTask', { id, message: `task is not updated`, error: true })
        }
    })
    //get tasks
    socket.on('getTasks', async(data) => {
        if(data.get) {
            const tasksList = await taskModel.find({}).lean()
            socket.emit('cbGetTasks', tasksList)
        }
    })
    //get task by id
    socket.on('getTaskById', async(data) => {
        const { id } = data
        const task = await taskModel.findById(id)
        socket.emit('cbGetTaskById', task)
    })
    //registration
    socket.on('registration', async(data) => {
        const {repassword, ...restBody} = data
        const loginCheck = await userModel.findOne({ email: restBody.email })

        if (loginCheck) {
            socket.emit('cbRegistation', { login: restBody.email, message: `login is exist`, error: true })
        } else if (restBody.password === repassword) {
            const user = new userModel(restBody)
            await user.save()
            socket.emit('cbRegistation', { login: restBody.email, message: `registration ok`, error: false })
        } else {
            socket.emit('cbRegistation', { login: restBody.email, message: `password not match`, error: true })
        }
    })
    //get user info
    socket.on('userInfo', async(data) => {
        const user = data.email
        const targetUser = await userModel.findOne({ email: user })
        const plainUser = JSON.parse(JSON.stringify(targetUser))
        delete plainUser.password

        if (targetUser) {
            socket.emit('cbUserInfo', { message: 'OK', error: false, plainUser })
        } else {
            socket.emit('cbUserInfo', { message: 'not found', error: true, user })
        }
    })
    //update profile
    socket.on('updateUser', async(data) => {

        const {email , firstName, lastName } = data
        const targetUser = await userModel.findOne({ email: email })
        if (targetUser) {
            await userModel.updateOne({ email: email }, {
                $set: { firstName, lastName }
            })
            await socket.emit('cbUpdateUser', { message: 'user is updated', error: false, targetUser })
        } else {
            socket.emit('cbUpdateUser', { message: 'user is not updated', error: true, login: email })
        }
    })
    //disconnect
    socket.on('disconnect', () => {
        console.log('client has disconnected!')
    })
})

app.use('/tasks', checkAuth)
//get task
//save new task
//get task by id
//registation
//login
//delete task
//get user info
//update profile
//update task

app.get('/logout', (req, res) => {
    req.logout()
    res.status(200).send({ message: 'logout', error: false })
})

server.listen(config.port, () => {
    console.log(`Server stat in ${config.port}`)
})