const colors = require('colors')
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('What is your name?'.rainbow, (answer) => {
    console.log('Hello, '.green + ` ${answer} `.bgBrightWhite.black);

    rl.close();
});
