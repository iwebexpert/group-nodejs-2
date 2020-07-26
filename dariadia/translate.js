const request = require("request");
const readline = require("readline");

const rl = readline.createInterface(process.stdin, process.stdout);
const token =
  "trnsl.1.1.20190715T115323Z.de999f2538b45f57.1249c05147e9388605de04896171da63f9001072";
const chalk = require("chalk");

rl.question("Please enter the word you would like to translate: ", (word) => {
  request(
    `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${token}&lang=en-ru&text=${word}`,
    (err, response, html) => {
      if (err) {
        console.log(chalk`{blue Sorry, something went wrong: , ${err}}`);
      } else if (!err && response.statusCode === 200) {
        const translate = JSON.parse(html);
        console.log(chalk`{green ${translate.text[0]} }`);
      }
    }
  );
  rl.close();
});
