/**
 * Created by ankho on 06.08.2020.
 */

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const taskSchema = new Schema({
    title: {type: String, required: true, unique: true},
    completed: {type: Boolean, default: false},
})

module.exports = mongoose.model('Task', taskSchema, 'tasks')