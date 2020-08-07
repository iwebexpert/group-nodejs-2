const express = require('express')

const TaskController = require('../controllers/task')

const router = express.Router()

router.post('/', TaskController.createTask)
router.put('/:id', TaskController.updateTask)
router.delete('/:id', TaskController.deleteTask)
router.get('/:id', TaskController.getTaskById)
router.get('/', TaskController.getTasks)

module.exports = router