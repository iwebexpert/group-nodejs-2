const readline = require('readline');
const request = require('request');
const parseArgs = require('minimist');
const {by639_1} = require('iso-language-codes');

const apiTranslator = () => {
    const argv = argumentParser();
    if(!argv) {
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const onLineUnput = cmd => {
        if (cmd === 'exit') {
            console.log('Goodbye');
            return rl.close();
        }

        const url = new URL(`https://api.mymemory.translated.net/get?q=${cmd}&langpair=${argv.f}|${argv.t}`).href;
        request(url, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                const translationObject = JSON.parse(body);
                console.log(`Word '${cmd}' is '${translationObject.responseData.translatedText}' in ${by639_1[argv.t].name}.\nEnter another one (type 'exit' to exit):`);
            }
        });
    };

    console.log(`Enter a word to translate from ${by639_1[argv.f].name} (type 'exit' to exit):`);
    rl.on('line', onLineUnput);
};

const argumentParser = () => {
    const argv = parseArgs(process.argv.slice(2));
    if (!argv.f || !argv.t) {
        console.log('Please enter program name with \'from\' & \'to\' arguments (e.g. -f en -t ru)');
        return;
    }

    if (!by639_1[argv.f] || !by639_1[argv.t]) {
        const isFArgWrong = !by639_1[argv.f];
        const wrongArg = process.argv.slice(2).filter(el => el === (isFArgWrong ? '-f' : '-t'));
        console.log(`You entered incorrect two-letter (e.g. 'en') language code '${isFArgWrong ? argv.f : argv.t}' for argument ${wrongArg}`);
        return;
    }

    if (argv.f === argv.t) {
        console.log('You passed identical arguments. Please provide different arguments');
        return;
    }

    return argv;
}

apiTranslator();
