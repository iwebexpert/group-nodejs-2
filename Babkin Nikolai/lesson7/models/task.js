const mongoose = require('mongoose')
const Schema = mongoose.Schema

const taskSchema = new Schema({
    user_id: {type: String, required: true},
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
})

module.exports = mongoose.model('Task', taskSchema, 'tasks')