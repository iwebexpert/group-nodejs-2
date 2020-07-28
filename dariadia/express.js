const express = require("express");
const consolidate = require("consolidate");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");
const nodeCookie = require("node-cookie");

const app = express();
const port = 4000;

const pages = {
  ru: "https://journal.bookmate.com/",
  sr: "https://zurnal.bookmate.com/",
};
const dictionary = { ru: 1, sr: 0 };
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
  const { count, topic, language } = nodeCookie.parse(req);
  res.render("articles", { count, topic, language });
});

app.post("/articles", (req, res) => {
  const topic = +req.body.topics;
  const count = +req.body.count;
  const language = +req.body.language;
  const page = language === dictionary.ru ? pages.ru : pages.sr;

  nodeCookie.create(res, "topic", topic);
  nodeCookie.create(res, "count", count);
  nodeCookie.create(res, "language", language);

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
        // Do not request more articles than the specified number
        if (i <= count) {
          let articleTopic = getKeyByValue(
            $(`.pitem:nth-child(${i})`).find(".type").text()
          );
          // Do not request other data if not the requested topic
          if (topic === 10 || topic === articleTopic) {
            articles[i] = {
              topicName: $(`.pitem:nth-child(${i})`).find(".type").text(),
              topic: articleTopic,
              title: $(`.pitem:nth-child(${i})`).find(".ititle").text(),
              cover: $(`.pitem:nth-child(${i})`).find("img").attr("src"),
            };
          }
        }
      });

      res.render("articles-assorted", {
        articles,
        topic,
        count,
        language: +language,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
