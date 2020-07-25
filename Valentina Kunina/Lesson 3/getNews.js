const request = require("request");
const cheerio = require("cheerio");

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
