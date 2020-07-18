const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface(process.stdin, process.stdout);

const win = "Won";
const lose = "Lost";
const heads = "heads";
const tails = "tails";
const ifUserWon = "You won the toss!";
const ifUserLost = "You lost the toss.";

let tossCoin = (userChoice) => {
  let outcome = Math.random() > 0.5 ? tails : heads;

  console.log(outcome === userChoice ? ifUserWon : ifUserLost);

  fs.appendFile(
    "headsTailsLogger.txt",
    `${outcome === userChoice ? win : lose}\n`,
    function (err) {
      if (err) return console.log(err);
    }
  );
};

rl.question(`Type ${tails} or ${heads}, then press ENTER\n`, (answer) => {
  tossCoin(answer);
  rl.close();
});
