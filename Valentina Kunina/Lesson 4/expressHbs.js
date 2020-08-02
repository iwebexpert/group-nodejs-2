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
  res.render("user", { ...user, mainNews }, (err, html) => {
    console.log(mainNews);
    res.send(html);
  });
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/news", (req, res) => {
  const quantityNews = req.body.count ? req.body.count : 10;
  console.log(req.body.count ? req.body.count : 10);
  const mainNews = news.mainNews;
  const sortedNews = mainNews.slice(0, quantityNews);
  res.render("news", { quantityNews, sortedNews });
});

app.listen(port, () => {
  console.log(`Server is running on Port: ${port}!`);
});
