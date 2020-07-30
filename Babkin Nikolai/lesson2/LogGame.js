const fs = require('file-system')

class LogGame {
    run(path) {
        const data = this.getDataFromFile(path)
        const result = this.analyzer(data)
        this.render(result)
    }

    getDataFromFile(path) {
        if (!fs.existsSync(path)) {
            console.log(`This file "${path}" dose not exist`)
        }
        return JSON.parse(fs.readFileSync(path, 'utf-8'))
    }

    analyzer(data) {
        const dataResult = data
        delete dataResult.isLastGameWon
        dataResult.ratioWonToLost = dataResult.gameWon / dataResult.gameLost
        return dataResult
    }

    render(data) {
        console.log('\n-------------------------')
        for (let key in data) {
            console.log(`${key} --- ${data[key]}`)
        }
        console.log('-------------------------\n')
    }
}

const logGame = new LogGame
logGame.run('./logGame.json')