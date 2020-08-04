const Task = require('../models/task')

createTask = (req, res) => {
    if (!req.body) return res.render('error', { success: false, error: 'You must provide a task' })
    
    const task = new Task(req.body)
    if (!task) return res.render('error', { success: false, error: err })
    
    task.save()
        .then(() => {
            return res.redirect('/tasks')
        })
        .catch(error => {
            return res.render('error', {error, message: 'Task not created!'})
        })
}

updateTask = async (req, res) => {
    if (!req.body) return res.render('error', { success: false, error: 'You must provide a body to update' })

    Task.findByIdAndUpdate(req.params.id, req.body, (err, task) => {
        if (err) return res.render('error', { error: err })
        task.save()
            .then(() => res.redirect('/tasks'))
            .catch(error => {
                return res.render('error', { error })
            })
    })
}

deleteTask = async (req, res) => {
    await Task.findOneAndDelete({ _id: req.params.id }, (err, task) => {
        if (err) {
            return res.render('error', { success: false, error: err })
        }
        return res.redirect('/tasks')
    }).catch(err => console.log(err))
}

getTaskById = async (req, res) => {
    await Task.findOne({ _id: req.params.id }, (err, task) => {
        if (err) {
            return res.render('error', { success: false, error: err })
        }
        if (!task) {
            return res.render('error', { success: false, error: `Task not found` })
        }
        return res.render('task', { success: true, task })
    }).lean().catch(err => console.log(err))
}

getTasks = async (req, res) => {
    await Task.find({}, (err, tasks) => {
        if (err) {
            return res.render('error', { success: false, error: err })
        }
        return res.render('main', { tasks })
    }).lean().catch(err => console.log(err))
}

updateForm = async (req, res) => {
    await Task.findOne({ _id: req.params.id }, (err, task) => {
        if (err) {
            return res.render('error', { success: false, error: err })
        }
        if (!task) {
            return res.render('error', { success: false, error: `Task not found` })
        }
        return res.render('updateForm', { success: true, task })
    }).lean().catch(err => console.log(err))
}

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    getTaskById,
    updateForm,
}