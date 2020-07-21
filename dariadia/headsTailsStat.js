const fs = require("fs");
const chalk = require("chalk");

const win = "Won";
const lose = "Lost";

const loggerFilePath = "headsTailsLogger.txt";

const countConsecutive = (data, flag) => {
  return Math.max(
    ...data.reduce(
      (sequence_lengths, x) => {
        x === flag ? sequence_lengths[0]++ : sequence_lengths.unshift(0);
        return sequence_lengths;
      },
      [0]
    )
  );
};

const prepareData = (data) => {
  const dataHelper = data.split(/\n/);
  const dataHelperArray = dataHelper.slice(0, dataHelper.length - 1); //last element is always an empty new line

  const total = dataHelperArray.length;
  const gamesWon = dataHelperArray.filter((gameResult) => gameResult === win)
    .length;
  const gamesLost = dataHelperArray.filter((gameResult) => gameResult === lose)
    .length;
  const winningRate = gamesWon / gamesLost;
  const winningSpreeCount = countConsecutive(dataHelperArray, win);
  const losingSpreeCount = countConsecutive(dataHelperArray, lose);

  console.log(chalk`
    Total: {blue ${total}}
    Games won: {green ${gamesWon}}
    Games lost: {red ${gamesLost}}
    Winning rate: {${winningRate >= 1 ? "green" : "red"} ${winningRate}}
    Max. wining spree: {green ${winningSpreeCount}}
    Max. losing spree: {red ${losingSpreeCount}}
  `);
};

const readStat = (filePath) => {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) throw err;
    prepareData(data);
  });
};

readStat(loggerFilePath);
