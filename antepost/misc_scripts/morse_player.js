const chalk = require('chalk');
const { encode, decode } = require('morsee');
const JZZ = require('jzz');
const prompt = require('promise-prompt');

module.exports = morsePlayer = async () => {
    const welcomingMessage = `Welcome to the \
${chalk.red('M')}\
${chalk.green('o')}\
${chalk.yellow('R')}\
${chalk.blue('s')}\
${chalk.magenta('E')}\
${chalk.bgCyan(' ')}\
${chalk.white('P')}\
${chalk.grey('a')}\
${chalk.redBright('L')}\
${chalk.greenBright('a')}\
${chalk.yellowBright('C')}\
${chalk.blueBright('e')}\
`;

    console.log(welcomingMessage);
    const message = await prompt('Type a message in English: ');
    const messageInMorse = encode(message);
    playMorse(messageInMorse);
};

const playMorse = async message => {
    console.log(`Morse code: ${message}`);
    console.log('Morse code started');
    for (let i = 0; i < message.length; i++) {
        process.stdout.write(message[i]);
        await playAnotherNote(message[i]);
        if (i === message.length - 1) {
            process.stdout.write('\n');
        }
    }
    console.log('Morse code ended');
};

const playAnotherNote = async symbol => {
    const port = await JZZ().openMidiOut();
    const config = {
        dotDuration: 300,
        channel: 0,
        note: 'C5',
        velocity: 127,
    }
    switch (symbol) {
        case '.':
            await playNote(
                port,
                config.dotDuration,
                config.channel,
                config.note,
                config.velocity,
            );
            break;
        case '-':
            await playNote(
                port,
                config.dotDuration * 3,
                config.channel,
                config.note,
                config.velocity,
            );
            break;
        case ' ':
        case '/':
            await playNote(
                port,
                config.dotDuration,
                config.channel,
                config.note,
                1,
            );
            break;
    }
};

const playNote = (port, dotDuration, channel, note, velocity) => {
    return port.noteOn(channel, note, velocity)
        .wait(dotDuration)
        .noteOff(channel, note)
        .close();
}
