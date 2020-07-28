const express = require("express");
const consolidate = require("consolidate");
const path = require("path");

const app = express();
const port = 4000;

// MiddleWare для работы с form
app.use(express.urlencoded({ extended: false })); // Для получения данных из body в методе POST

// MiddleWare для работы с JSON
app.use(express.json());

// Пользовательские MiddleWare, будет вызываться при каждом запросе
app.use((req, res, next) => {
  console.log("User's MiddleWare!");
  next();
});

// Данный MiddleWare будет запускаться при переходе на /users
app.use("/users", (req, res, next) => {
  console.log("User's MiddleWare-2 from Users!");
  next();
});

// Данный запрос будет обрабатываться только при полном совпадении url
app.all("/users", (req, res, next) => {
  console.log("User's ModdleWare-3 from Users - app.all()!");
  next();
});

// Парсим заголовки
app.use((req, res, next) => {
  //   console.log(req.headers);
  if (req.headers.test && req.headers.test === "value") {
    req.test = "Headers.test is ok! MiddleWare works!";
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/users", (req, res) => {
  console.log(req.query);
  res.send("Users!");
});

// GET запрос + параметры
app.get("/users/:id", (req, res) => {
  console.log(req.params);
  res.send("GET request + params works!");
});

app.post("/users", (req, res) => {
  console.log(req.body);
  console.log(req.body.name ? req.body.name : null);
  console.log(req.test ? req.test : "Заголовок Test не был передан!")
  res.send("Post method is works!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}!`);
});
