const chalk = require('chalk');
const notifier = require('r2d2');

const log = console.log;

const Luke = [
    'Yes, that\'s it. Dagobah.\n',
    'No, I\'m not going to change my mind about this.\n',
    'I\'m not picking up any cities or technology.  Massive life-form readings, though.  There\'s something alive down there...\n',
    'Yes, I\'m sure it\'s perfectly safe for droids.\n'
];

log(chalk.bgBlue.yellowBright('\n [ LUKE\'S X-WING ] \n'));

let key = 0;
setTimeout(function sayLuke() {
    if (key < Luke.length)
    {
        log(chalk.bold.green.underline('Luke:'));
        log(chalk.white(Luke[key++]));
        setTimeout(() => {
            log(chalk.bgGray.cyanBright('Artoo beeps...\n'));
            notifier.headsUp(() => {});
        }, 500);
    }
    else
    {
        return false;
    }
    setTimeout(sayLuke, 2200);
}, 1000);