const express = require('express')

const TaskController = require('../controllers/task')

const router = express.Router()

router.post('/task', TaskController.createTask)
router.post('/task/:id', TaskController.updateTask)
router.get('/update/:id', TaskController.updateForm)
router.get('/delete/:id', TaskController.deleteTask)
router.get('/task/:id', TaskController.getTaskById)
router.get('/', TaskController.getTasks)

module.exports = router