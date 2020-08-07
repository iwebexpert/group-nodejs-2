const chalk = require('chalk');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const rightAnswer = Math.random() >= .5 ? 1 : 0;
const winStr = 'WOW, you win!';
const loseStr = 'Sorry, you lose!';
const statsFile = './stats.json';

console.log(chalk.bgGreen.blackBright('Let\'s go, guess Head(1) OR Tail(0)?'));

rl.on('line', (answer) => {
    answer = answer.toLowerCase();

    if (answer === 'n' || answer === 'no' || answer === 'exit') {
        rl.close();
        return false;
    }


    if (+answer === rightAnswer) {
        drawAnswer(winStr);
        writeStats(statsFile, 1);
    } else {
        drawAnswer(loseStr);
        writeStats(statsFile, 0);
    }

    rl.close();
});

function drawAnswer(str) {
    let idx = 0;
    setTimeout(function drawLetter() {
        if (idx >= str.length) {
            return false;
        }

        const letter = str[idx];
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        process.stdout.write(chalk.rgb(r,g,b).underline(letter));

        setTimeout(() => {drawLetter()}, 25, str, ++idx);
    }, 25, str, idx);
}

function writeStats(file, status) {
    let stats = null;
    fs.readFile(file, (err, data) => {
        if (err) throw err;

        try {
            stats = JSON.parse(data);
        } catch (e) {
            stats = [];
        }

        stats.push(status);

        fs.writeFile(file, JSON.stringify(stats), (err) => {
            if (err) throw err;
        });
    });
}