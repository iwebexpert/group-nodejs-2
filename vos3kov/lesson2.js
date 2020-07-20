const inputFile = require('minimist')(process.argv.slice(2))._[0]
const fs = require('fs')
const readline = require('readline')
const defaultFileName = 'games.log'
const filename = inputFile ? inputFile : defaultFileName
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let number = 0

console.log('Загадано число. 0 или 1. \nПопробуете угадать?\n')

writeResult = (answer) => {
    fs.appendFile(filename, answer.toString(), { encoding: 'utf8' } , (err, data) => {
        if(err){ throw err }})
    return answer > 0 ? 'И ... угадали!' : 'и ошиблись...'
}

rl.on('line', (cmd) => {
    number = +Math.floor(Math.random() * 2)
    if(cmd === 'exit'){
        console.log('Спасибо и до встречи.')
        rl.close()
    }else {
        console.log(`Вы предположили: ${cmd}. ${+cmd === number ? writeResult(0) : writeResult(1)}`)
        console.log('Пробуем снова?')
        console.log('Загадано число. 0 или 1. \nПопробуете угадать?\n')
    }
})


