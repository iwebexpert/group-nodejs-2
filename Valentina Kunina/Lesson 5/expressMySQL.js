const express = require("express");
const path = require("path");

const app = express();
const port = 4000;

const taskMysql = require("./models/taskMysql");

app.use(express.urlencoded({ extended: false })); // middleware для работы с form
app.use(express.json()); // для работы с JSON

app.get("/tasks", async (req, res) => {
  const tasks = await taskMysql.getAll(); // вызываем метод getAll() из taskMysql
  res.json(tasks);
});

app.listen(port, () => {
  console.log(`Server was running on port: ${port}`);
});
