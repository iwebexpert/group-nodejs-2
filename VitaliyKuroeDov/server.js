const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const config = require('./config')

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

app.use('/tasks', checkAuth)
//get task
app.get('/tasks', async (req, res) => {
    const tasksList = await taskModel.find({}).lean()
    res.status(200).json(tasksList)
})
//save new task
app.post('/tasks', async (req, res) => {
    const task = new taskModel(req.body)
    const isSaved = await task.save()
    res.status(201).json(isSaved)
})

//get task by id
app.get('/tasks/:id', async (req, res) => {
    const task = await taskModel.findById(req.params.id)
    res.status(200).json(task)
})
//registation
app.post('/register', async (req, res) => {
    const {repassword, ...restBody} = req.body
    
    if(restBody.password === repassword) {
        const user = new userModel(restBody)
        await user.save()
        res.status(201).send()
    } else {
        res.status(400).json({message: 'User exists'})
    }
})
//login
app.post('/auth', async(req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(401).send()
    }

    if(!user.validatePassword(password)){
        return res.status(401).send()
    }

    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password

    res.status(200).json({
        ...plainUser,
        token: jwt.sign(plainUser, SECRET)
    })
})
//delete task
app.delete('/tasks/:id', async(req, res) => {
    const { id } = req.body
    const targetTask = await taskModel.findById(id)

    if(targetTask) {
        await taskModel.deleteOne(targetTask)
        res.status(200).send({message: `${id} is deleted`})
    } else {
        res.status(400).send({message: `${id} not found`})
    }
})
//update task
app.patch('/tasks/:id', async(req, res) => {
    const { id, title, complited } = req.body
    const targetTask = await taskModel.findById(id)

    if(targetTask) {
        await taskModel.updateOne({ _id: id }, {
            $set: {
                title,
                complited
            }
        })
        res.status(200).send({message: `${id} task is updated`})
    } else {
        res.status(400).send({message: `${id} task is not found`})
    }
})

app.listen(config.port, () => {
    console.log(`Server stat in ${config.port}`)
})