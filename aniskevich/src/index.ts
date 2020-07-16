import { gTTS } from 'gtts.js'
import * as readline from 'readline'
import chalk from 'chalk'
const player = require('play-sound')()

const filePath = 'output.mp3'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.question('Please enter your text \n', (input: string) => {
    console.log('Processing, please wait....')
    const tts = new gTTS(input)
    rl.close()
    tts.save(filePath)
    .then(() => {
        player.play(filePath, (err: any) => {
            if (err) throw err
        })
        console.log(chalk.red(`Your text is: ${input}`))
    })
    .catch((err) => {
        throw err
    })
})

