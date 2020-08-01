const { Schema, model, ObjectId } = require('mongoose');

const taskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  user: { type: ObjectId, ref: 'User' },
});

module.exports = model('Task', taskSchema, 'tasks');