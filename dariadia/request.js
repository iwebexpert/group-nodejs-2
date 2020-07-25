const request = require("request");
const cheerio = require("cheerio");

const page = "https://journal.bookmate.com/";

request(page, (err, response, body) => {
  if (!err && response.statusCode === 200) {
    const $ = cheerio.load(body);

    const featuredArticle = {
      type: $(".maindsc").find(".type").text(),
      title: $(".maindsc").find("h2").text(),
      cover: `${page}${$(".bigthumb").attr("src")}`,
    };

    const articles = [];

    $(".pitem").each(function (i, elem) {
      articles[i] = {
        type: $(`.pitem:nth-child(${i})`).find(".type").text(),
        title: $(`.pitem:nth-child(${i})`).find(".ititle").text(),
        cover: $(`.pitem:nth-child(${i})`).find("img").attr("src"),
      };
    });

    console.log([featuredArticle, ...articles]);
  }
});
