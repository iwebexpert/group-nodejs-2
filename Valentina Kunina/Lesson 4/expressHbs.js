const express = require("express");
const consolidate = require("consolidate");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");

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
  const user = users[req.params.id];
  console.log(user);
  if (user ? user : "1") res.render("user", user);
});

app.listen(port, () => {
  console.log(`Server is running on Port: ${port}!`);
});

request("https://rg.ru/", (err, res, body) => {
  if (!err && res.statusCode === 200) {
    const $ = cheerio.load(body);
    const mainNews = $("div.b-news__list-item")
      .find("h2")
      .find("a")
      .map((i, el) => $(el).text())
      .get()
      .join("\n");

    console.log(mainNews);

    const secondaryNews = $("div.b-news-inner__list-item-wrapper")
      .find("h2")
      .find("a")
      .map((i, el) => $(el).text())
      .get()
      .join("\n");

    console.log(secondaryNews);
  }
});
