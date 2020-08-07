const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const SECRET_KEY = 'HYhau^523ej2hg3e887tUyUyf987e9wdfkhgI&Tk8369ax8aksjdoqyidod8ays'

mongoose.connect('mongodb://192.168.99.100:32768/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const taskModel = require('./models/taskMongo')
const userModel = require('./models/user')

const app = express()
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

//Методы для обработки запросов
app.get('/tasks', async (req, res) => {
    const tasks = await taskModel.find({}).lean()
    res.status(200).json(tasks)
})

app.post('/tasks', async (req, res) => {
    const task = new taskModel(req.body)
    const isSaved = await task.save()
    res.status(200).json(isSaved)
})

app.get('/tasks/:id', async (req, res) => {
    const { id } = req.params
    const task = await taskModel.findById(id)
    res.status(200).json(task)
})

app.delete('/tasks/:id', async (req, res) => {
    await taskModel.deleteOne({_id: req.params.id}, (err) => {
        if (err) {
            return res.status(500).json({message:"Не удалось удалить!"})
        }
    })
    res.status(200).send()
})

app.patch('/tasks/:id', async (req, res) => {
    const { id } = req.params
    const task = await taskModel.findById(id)
    if (!task) {
        return res.status(404).json({message:"Не найден объект для изменения!"})
    }
    const title = req.body.title ? req.body.title : task.title
    const priority = req.body.priority ? req.body.priority : task.priority
    await taskModel.updateOne(
        {_id: id},
        {title: title, priority: priority},
        (err) => {if (err) {
            return res.status(500).json({message:"Не удалось обновить!"})
        }})
    res.status(205).send()
})

//Для авторизации и регистрации
app.post('/register', async (req, res) => {
    const { repassword, ...restBody } = req.body
    if(restBody.password === repassword){
        const user = new userModel(restBody)
        await user.save()
        res.status(201).send()
    } else {
        res.status(400).json({message: 'Incorrect passwords!'})
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

app.listen(4000, () => {
    console.log('The server has been started!')
})