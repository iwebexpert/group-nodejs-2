const inquirer = require('inquirer')
const argv = require('minimist')(process.argv.slice(2))

const logger = require('./logger')

const options: Array<string> = ['head', 'tail']
const result: string = options[Math.floor(Math.random() * options.length)]
let log: typeof logger
if (argv.l) log = new logger(argv.l)
else log = new logger()


type Answers = {
    answer: string
}

inquirer.prompt({
    name: 'answer',
    message: 'Please choose your option',
    type: 'list',
    choices: options
}).then((answers: Answers) => {
    let option: string
    if (answers.answer === result) {
        console.log('You win')
        option = 'true'
    }
    else {
        console.log('You lose')
        option = 'false'
    }
    log.write(option)
    log.getStats()
})