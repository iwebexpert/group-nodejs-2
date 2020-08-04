const mongoose = require("mongoose");

const Schema = mongoose.Schema; // Берем схему из mongoose

// Описываем схему, те поля которые у нас будут
const taskSchema = new Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Task', taskSchema, 'tasks'); // модель с большой буквы, коллекция - с маленькой
