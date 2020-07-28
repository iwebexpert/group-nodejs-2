const express = require("express");
const consolidate = require("consolidate");
const path = require("path");
const news = require("../Lesson 3/getNews");

const app = express();
const port = 4000;

const users = {
  1: {
    userName: "Anna",
    age: 25,
    skills: ["JS", "Node.js", "Express.js"],
  },
  2: {
    userName: "Ivan",
    skills: ["TypeScript", "Node.js", "Ruby"],
  },
};

app.engine("hbs", consolidate.handlebars); // Подключение handlebars
app.set("view engine", "hbs"); // Какое расширение исп-ем
app.set("views", path.resolve(__dirname, "views")); // Путь к шаблону

app.get("/users/:id", (req, res) => {
  const user = users[req.params.id] ? users[req.params.id] : users[1];
  console.log(user);
  const mainNews = news.mainNews;
  const secondaryNews = news.secondaryNews;
  res.render("user", { user, mainNews, secondaryNews }, (err, html) => {
    res.send(html);
  });
});

app.post("/news", (req, res) => {
  console.log(req.body);
  // console.log(req.body.param1);
  res.render("user", {});
});

app.listen(port, () => {
  console.log(`Server is running on Port: ${port}!`);
});
