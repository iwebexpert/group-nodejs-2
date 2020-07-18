const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface(process.stdin, process.stdout);

let tossCoin = (userChoice) => {
  let outcome = Math.random() > 0.5 ? "tails" : "heads";

  console.log(
    outcome === userChoice ? "You won the toss!" : "You lost the toss."
  );

  fs.appendFile(
    "headsTailsLogger.txt",
    `${outcome === userChoice ? "Won" : "Lost"}\n`,
    function (err, data) {
      if (err) {
        return console.log(err);
      }
      console.log(data);
    }
  );
};

rl.question("Type heads or tails, then press ENTER\n", (answer) => {
  tossCoin(answer);
  rl.close();
});
