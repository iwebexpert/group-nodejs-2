const mongoose = require('mongoose')

const Schema = mongoose.Schema

const taskSchema = new Schema({
    title: {type: String, required: true},
    complited: {type: Boolean, default: false}
})

module.exports = mongoose.model('Task', taskSchema, 'tasks')