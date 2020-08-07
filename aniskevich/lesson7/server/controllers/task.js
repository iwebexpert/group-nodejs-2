const Task = require('../models/task')

createTask = (req, res) => {
    //Почему-то проверки (!req.body) и (!task) не срабатывают, срабатывает только catch
    const task = new Task(req.body)
    task.save()
        .then(() => {
            return res.status(201).json({ success: true, task })
        })
        .catch(error => res.status(400).json({ success: false, error: error.message }))
}

updateTask = async (req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body, {new: true}, (error, task) => {
        if (error) return res.render('error', { error })
        task.save()
            .then(() => {
                return res.status(200).json({ success: true, task })
            })
            .catch(error => res.status(400).json({ success: false, error: error.message }))
    })
}

deleteTask = async (req, res) => {
    await Task.findOneAndDelete({ _id: req.params.id }, (error, task) => {
        if (error) {
            return res.status(400).json({ success: false, error: `Can\'t delete ${req.params.id}` })
        }
        return res.status(200).json({ success: true, id: task._id })
    }).catch(error => res.status(400).json({ success: false, error: error.message }))
}

getTaskById = async (req, res) => {
    await Task.findOne({ _id: req.params.id }, (error, task) => {
        if (error) {
            console.log(error)
        }
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' })
        }
        return res.status(200).json({ success: true, task })
    }).lean().catch(error => res.status(400).json({ success: false, error: error.message }))
}

getTasks = async (req, res) => {
    await Task.find({}, (error, tasks) => {
        if (error) {
            console.log(error)
        }
        return res.status(200).json(tasks)
    }).catch(error => res.status(400).json({ success: false, error: error.message }))
}

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    getTaskById,
}