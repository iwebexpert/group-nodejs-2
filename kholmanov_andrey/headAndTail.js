/**
 * Created by ankho on 23.07.2020.
 */

const readline = require('readline')
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

console.log(`Введите Орел(1) или Решка(2)`)

rl.on('line', (cmd) => {
    const number = Math.random() < .5 ? 1 : 2;
    // console.log(`Random: ${number}`)

    if(cmd === 'exit'){
        rl.close()
    }

    if (+cmd === number) {
        switch (number){
            case 1:
                console.log(`Ура!!! Орел`)
                writeLog(1)
                break
            case 2:
                console.log(`Ура!!! Решка`)
                writeLog(1)
                break
        }
    } else {
        console.log(`Не угадали!!! Попробуйте еще раз!`)
        writeLog(0)
    }
})

function writeLog(status) {
    const file = 'log.json'
    let stats = null
    fs.readFile(file, (err, data) => {
        if (err) throw err

        try {
            stats = JSON.parse(data)

            if (status === 1) {
                stats.winner = stats.winner + 1
            } else {
                stats.loser = stats.loser + 1
            }

        } catch (e) {
            stats = {
                winner: status ? 1 : 0,
                loser: !status ? 1 : 0
            }
        }

        fs.writeFile(file, JSON.stringify(stats), (err) => {
            if (err) throw err
        })
    })
}