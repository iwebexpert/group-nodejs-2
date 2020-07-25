const express = require("express");
const consolidate = require("consolidate");
const path = require("path");

const app = express();

const users = {
  anna: {
    username: "Anna",
    age: 27,
    skills: ["JS", "Node.js", "Express.js"],
  },
  ivan: {
    username: "Ivan",
    skills: ["TypeScript", "Node.js"],
  },
};

app.engine("hbs", consolidate.handlebars);
app.set("view engine", "hbs");
app.set("views", path.resolve(__dirname, "views"));

//Middleware для работы с form
app.use(express.urlencoded({ extended: false }));

//Для работы с JSON
app.use(express.json());

//Пользовательские middleware
app.use("/users", (req, res, next) => {
  console.log("User middleware2! /users");
  next();
});

//Срабатывает только на полное совпадение url
app.all("/users", (req, res, next) => {
  console.log("User middleware3! /users - app.all()");
  next();
});

app.use((req, res, next) => {
  //console.log(req.headers)
  if (req.headers.test && req.headers.test === "js") {
    req.test = "Test Ok! Middleware works";
  }
  next();
});

app.use((req, res, next) => {
  console.log("User middleware!");
  next();
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/users", (req, res) => {
  console.log(req.query);
  res.send("Users!");
});

app.post("/users", (req, res) => {
  console.log(req.body);
  console.log(req.body.name ? req.body.name : null);

  console.log(req.test ? req.test : "Заголовок test не был передан");

  res.send("Post method works!");
});

//GET + params
app.get("/users/:username", (req, res) => {
  //console.log(req.params)
  //res.send('GET + params works!')

  const user = users[req.params.username]
    ? users[req.params.username]
    : users["anna"];
  res.render("user", user);
});

//Для ДЗ
app.post("/settings", (req, res) => {
  console.log(req.body);
  console.log(req.body.param1 ? req.body.param1 : 10);
  res.render("user", {});
});

app.listen(4000, () => {
  console.log("The server has been started!");
});
