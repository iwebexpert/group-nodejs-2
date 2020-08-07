const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const consolidate = require("consolidate");

const app = express();
const port = 4000;

const taskMongoose = require("./models/taskMongo");

app.engine("hbs", consolidate.handlebars); // Подключение handlebars
app.set("view engine", "hbs"); // Какое расширение исп-ем
app.set("views", path.resolve(__dirname, "views")); // Путь к шаблону

// открываем соединение c базой
mongoose.connect("mongodb://localhost:32772/todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: false })); // middleware для работы с form
app.use(express.json()); //  для работы с JSON

// чтение tasks
app.get("/tasks", async (req, res) => {
  const tasks = await taskMongoose.find({}).lean();
  res.render("todos", { tasks }, (err, html) => {
    res.send(html);
  });
});

// создание task
app.post("/tasks", async (req, res) => {
  const title = req.body.title;
  const task = new taskMongoose({ ...req.body, title });
  const isSaved = await task.save();
  // console.log(task);
  res.redirect("/tasks");
});

// удаление task по id
app.post("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const task = await taskMongoose.findOne({ _id: id }).deleteOne();
  res.redirect("/tasks");
});

// обновление task по id
app.post("/tasks/edit/:id", async (req, res) => {
  const id = req.params.id;
  const newTitle = req.body.newTitle;
  const task = new taskMongoose({ ...req.body, newTitle });
  // const newTask = await taskMongoose.findByIdAndUpdate(id, newTitle);
  console.log(id, newTitle);
  const isSaved = await task.save();
  res.redirect("/tasks");
});

app.listen(port, () => {
  console.log(`Server was running on port: ${port}!`);
});
