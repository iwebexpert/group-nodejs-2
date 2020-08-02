const mongoose = require('mongoose')

const Schema = mongoose.Schema

const taskSchema = new Schema({
  title: {type: String, required: true},
  status: {type: String, default: 'to do'},
  priority: {type: String, default: 'normal'},
})

module.exports = mongoose.model('Task', taskSchema, 'tasks')
