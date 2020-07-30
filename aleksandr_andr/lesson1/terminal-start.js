const chalk = require('chalk')
const beep = require('beepbeep')
const log = console.log

log(chalk.hex('#7000ff').bgGray('Терминал готов'))
beep(3, 100)

log(chalk.hex('#ff7000').underline.bgGray('Жду команды...'))
beep(1, 100)