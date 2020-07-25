const express = require("express");
const consolidate = require("consolidate");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");
//const nodeCookie = require("node-cookie");

const app = express();
const pageRussian = "https://journal.bookmate.com/";
const pageSerbian = "https://zurnal.bookmate.com/";
const ru = 1;
const sr = 0;
const legend = {
  1: ["Книги", "Knjige"],
  2: ["Тренды", "Trendovi"],
  3: ["Интервью", "Intervjui"],
  4: ["Писатели", "Pisci"],
  5: ["Истории", "Priče"],
  6: ["Букмейт", "Bookmate"],
};

const getKeyByValue = (topicName) => {
  return +Object.keys(legend).find((key) => legend[key].includes(topicName));
};

app.engine("hbs", consolidate.handlebars);
app.set("view engine", "hbs");
app.set("views", path.resolve(__dirname, "views"));

//Middleware для работы с form
app.use(express.urlencoded({ extended: false }));

//Для работы с JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.render("articles", {});
});

app.post("/articles", (req, res) => {
  const topic = +req.body.topics;
  const count = +req.body.count;
  const language = +req.body.language;
  const page = language === ru ? pageRussian : pageSerbian;

  request(page, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      const $ = cheerio.load(body);

      const featuredArticle = {
        topicName: $(".maindsc").find(".type").text(),
        topic: getKeyByValue($(".maindsc").find(".type").text()),
        title: $(".maindsc").find("h2").text(),
        cover: $(".bigthumb").attr("src"),
      };

      const articles = [featuredArticle];

      $(".pitem").each(function (i, elem) {
        if (i <= count) {
          articles[i] = {
            topicName: $(`.pitem:nth-child(${i})`).find(".type").text(),
            topic: getKeyByValue(
              $(`.pitem:nth-child(${i})`).find(".type").text()
            ),
            title: $(`.pitem:nth-child(${i})`).find(".ititle").text(),
            cover: $(`.pitem:nth-child(${i})`).find("img").attr("src"),
          };
        }
      });

      const resultArticles =
        topic !== 10
          ? articles.filter((article) => article.topic === topic)
          : articles;

      console.log(resultArticles);

      res.render("articles-assorted", {
        articles: resultArticles,
        topic,
        count,
        language: +language,
      });
    }
  });
});

app.listen(4000, () => {
  console.log("The server has been started!");
});
