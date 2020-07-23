/**
 * Created by ankho on 23.07.2020.
 */

const readline = require('readline')
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

console.log(`Введите Орел(1) или Решка(2) (статистика игр - status)`)

rl.on('line', (cmd) => {
    const number = Math.random() < .5 ? 1 : 2;
    // console.log(`Random: ${number}`)

    if(cmd === 'exit'){
        rl.close()
        return false;
    }

    if(cmd === 'status'){
        readLog()
        rl.close()
        return false;
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

            stats.games = stats.games + 1
            if (status === 1) {
                stats.winner = stats.winner + 1
            } else {
                stats.loser = stats.loser + 1
            }
            stats.prev.push(status)
        } catch (e) {
            stats = {
                games: 1,
                winner: status ? 1 : 0,
                loser: !status ? 1 : 0,
                prev: [
                    status
                ]
            }
        }

        fs.writeFile(file, JSON.stringify(stats), (err) => {
            if (err) throw err
        })
    })
}

function readLog() {
    const file = 'log.json'

    fs.readFile(file, (err, data) => {
        if (err) throw err

        stats = JSON.parse(data)

        const result = {
            count: 0,
            win: 0,
            los: 0
        }

        stats.prev.forEach((item, i, arr) => {
            if (i > 0 && item !== arr[i - 1]) {
                if (!item) {
                    result.win = Math.max(result.count, result.win)
                } else {
                    result.los = Math.max(result.count, result.los)
                }
                result.count = 0
            }

            result.count++

            if (i === arr.length - 1) {
                if (item) {
                    result.win = Math.max(result.count, result.win)
                } else {
                    result.los = Math.max(result.count, result.los)
                }
            }
        })

        // console.log(stats, result)
        console.log('Количество игр: ', stats.games)
        console.log('Количество побед: ', stats.winner)
        console.log('Количество поражений: ', stats.loser)
        console.log('Соотношение победы/поражения: ', stats.winner/stats.loser)
        console.log('Побед подряд: ', result.win)
        console.log('Поражений подряд: ', result.los)
    })
}