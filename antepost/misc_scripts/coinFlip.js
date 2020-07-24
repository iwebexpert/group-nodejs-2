const fs = require('fs');
const readline = require('readline');
const isValid = require('is-valid-path');

const coinFlipGame = () => {
    const filename = process.argv[2];

    if (!isValid(filename)) {
        console.log(`${filename} is not a valid path to file. Please provide a working logfile path as the first argument`);
        return;
    }

    console.log(`Game logs will be written to '${filename}'`);
    console.log('Choose heads or tails (type exit to end game):');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const onLineUnput = cmd => {
        if (cmd === 'exit') {
            console.log('Goodbye');
            return rl.close();
        }

        const result = Math.floor(Math.random() * 2) + 1 === 1 ? 'heads' : 'tails';
        console.log(`You entered: ${cmd}. The coin flipped on its ${result}. You ${cmd === result ? 'won' : 'lost'}. Try again (type exit to end game)`);
        fs.appendFile(filename, `${cmd},${cmd === result ? 'won' : 'lost'}\n`, err => {
            if (err) throw err;
        });
    };

    rl.on('line', onLineUnput);
};

coinFlipGame();
