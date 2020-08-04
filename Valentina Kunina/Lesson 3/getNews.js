const request = require("request");
const cheerio = require("cheerio");

request("https://rg.ru/news.html", (err, res, body) => {
  if (!err && res.statusCode === 200) {
    const $ = cheerio.load(body);
    const arrayMainNews = [];
    // const arraySecondaryNews = [];
    const mainNews = $("div.b-news-inner__list-item-wrapper")
      .find("h2")
      .find("a")
      .map((i, el) => {
        let element = $(el).text().trim();
        return (arrayMainNews[i] = element);
      })
      .get();

    module.exports.mainNews = arrayMainNews;

    console.log(arrayMainNews);

    // secondaryNews = $("div.b-news-inner__list-item-wrapper")
    //   .find("h2")
    //   .find("a")
    //   .map((i, el) => {
    //     let element = $(el).text().trim();
    //     return (arraySecondaryNews[i] = element);
    //   })
    //   .get();

    // module.exports.secondaryNews = arraySecondaryNews;

    // console.log(arraySecondaryNews);
  }
});
