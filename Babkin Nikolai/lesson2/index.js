const readline = require('readline')
const fs = require('file-system')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

class Game {
    dataInit = {
        gameTotal: 0,
        gameWon: 0,
        gameLost: 0,
        gameWonInRow: 0,
        gameLostInRow: 0,
        isLastGameWon: null,
    }

    defaultPath = './logGame.json'

    data = null
    maxLostInRow = 0
    maxWonInRow = 0

    run() {
        this.getDataFromFile()
        this.startGame()
    }

    getData() {
        return this.data
    }

    setData(data) {
        this.data = data
    }

    getDataFromFile(path = this.defaultPath) {
        if (!fs.existsSync(path)) {
            this.putDataToFile(this.dataInit, path)
        }

        let data = fs.readFileSync(path, 'utf-8')
        this.setData(JSON.parse(data))
    }

    putDataToFile(data, path = this.defaultPath) {
        fs.writeFileSync(path, JSON.stringify(data), 'utf-8')
    }

    calcWon(data) {
        data.gameWon++;
        this.maxLostInRow = 0

        if (data.isLastGameWon === true) {
            this.maxWonInRow++;
        } else if (+this.maxWonInRow === 0) {
            this.maxWonInRow = 1
        }

        if (this.maxWonInRow > data.gameWonInRow) {
            data.gameWonInRow = this.maxWonInRow
        }

        data.isLastGameWon = true

        return data
    }

    calcLost(data) {
        data.gameLost++;
        this.maxWonInRow = 0

        if (data.isLastGameWon === false) {
            this.maxLostInRow++;
        } else if (+this.maxLostInRow === 0) {
            this.maxLostInRow = 1
        }

        if (this.maxLostInRow > data.gameLostInRow) {
            data.gameLostInRow = this.maxLostInRow
        }

        data.isLastGameWon = false
        return data
    }

    startGame() {
        console.log('\nHello!!! Welcome to the Game. \n ---Rules game: You must to guess the number 1 or 2. \n Enter "end" for exit')

        rl.on('line', (cmd) => {
            console.log('------------------------------------')

            if (cmd === "end") {
                console.log('---Bye')
                rl.close()
            } else if (cmd === '1' || cmd === '2') {
                const number = Math.floor(Math.random() * 2 + 1)
                let data = this.getData()

                if (+cmd === number) {
                    console.log('You guessed!')

                    data = this.calcWon(data)
                } else {
                    console.log('You did not guess!')

                    data = this.calcLost(data)
                }

                data.gameTotal++;
                this.putDataToFile(data)
            } else {
                console.log('---Please, input 1 or 2')
            }

            console.log('------------------------------------\n')
        })
    }
}

const game = new Game;
game.run()