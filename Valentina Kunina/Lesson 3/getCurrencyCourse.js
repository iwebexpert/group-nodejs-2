const request = require("request");
const cheerio = require("cheerio");

request("https://www.banki.ru/products/currency/", (err, res, body) => {
  if (!err && res.statusCode === 200) {
    const $ = cheerio.load(body);
    const usd = $('tr[data-currency-code="USD"]').find("td").eq(1).text();

    console.log(`Текущий курс USD: ${usd} руб.`);
  }
});
