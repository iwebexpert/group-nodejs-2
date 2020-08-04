const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const port = 4000;

const taskMongoose = require("./models/taskMongo");

// открываем соединение c базой
mongoose.connect("mongodb://localhost:32772/todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: false })); // middleware для работы с form
app.use(express.json()); //  для работы с JSON

app.get("/tasks", async (req, res) => {
  const tasks = await taskMongoose.find({}); // вызываем метод getAll() из taskMysql
  res.json(tasks);
});

app.listen(port, () => {
  console.log(`Server was running on port: ${port}`);
});
