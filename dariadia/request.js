const request = require("request");
const cheerio = require("cheerio");

const page = "https://journal.bookmate.com/";

request(page, (err, response, body) => {
  if (!err && response.statusCode === 200) {
    const $ = cheerio.load(body);

    const featuredArticle = $(".maindsc").find("h2").text();

    const articles = [];
    $(".ititle").each(function (i, elem) {
      articles[i] = $(this).text();
    });

    const assortment = `${featuredArticle}\n${articles.join("\r\n")}`;

    console.log(`Свежие статьи:\n${assortment}`);
  }
});
