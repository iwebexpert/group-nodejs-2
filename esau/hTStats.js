const chalk = require('chalk');
const fs = require('fs');
const parseArgs = require('minimist')

const argv = parseArgs(process.argv.slice(2), {
    alias: {
        file: ['f']
    }
});

const statsFile = argv['file'];

let stats = null;
fs.readFile(statsFile, (err, data) => {
    if (err) throw err;

    try {
        stats = JSON.parse(data);
    } catch (e) {
        stats = [];
    }

    const wins = stats.filter(res => res).length;
    const losses = stats.filter(res => !res).length;
    const ratio = losses ? (wins / losses).toFixed(1) : wins;

    let winsOnEnd = 0,
        lossesOnEnd = 0,
        series = 0;

    stats.forEach((res, idx, arr) => {
        if (idx > 0 && res !== arr[idx - 1]) {
            if (res) {
                lossesOnEnd = Math.max(series, lossesOnEnd);
            } else {
                winsOnEnd = Math.max(series, winsOnEnd);
            }
            series = 0;
        }

        series++;

        if (idx === arr.length - 1) {
            if (res) {
                winsOnEnd = Math.max(series, winsOnEnd);
            } else {
                lossesOnEnd = Math.max(series, lossesOnEnd);
            }
        }
    });

    console.log('Total games:', stats.length);
    console.log('Total wins:', chalk.green(wins));
    console.log('Total losses:', chalk.red(losses));
    console.log('W/L Ratio:', chalk.rgb(112, 54, 95)(ratio));
    console.log('Wins on end:', chalk.rgb(12, 54, 195)(winsOnEnd));
    console.log('Losses on end:', chalk.rgb(95, 54, 180)(lossesOnEnd));
});


