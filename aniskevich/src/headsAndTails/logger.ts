const fs = require('fs')
const readline = require('readline')

type Stats = {
    totalGames: number
    totalWins: number
    totalLoses: number
    maxWinsSequence: number
    maxLosesSequence: number
    winRate: number
}

module.exports = class Logger {
    constructor(fileName: string = 'log.txt') {
        this.fileName = fileName
        this.stats = {
            totalGames: 0,
            totalWins: 0,
            totalLoses: 0,
            maxWinsSequence: 0,
            maxLosesSequence: 0,
            winRate: 0,
        }
        this.data = []
    }

    private fileName: string
    private stats: Stats
    private data: Array<string>

    private getGameNumber(): number {
        if (!fs.existsSync(this.fileName)) fs.writeFileSync(this.fileName, '')
        const data = fs.readFileSync(this.fileName, 'utf-8')
        return data.split('\n').length
    }
    private checkSequence(value: string): number {
        const temp: Array<number> = []
        let idx: number = 0
        this.data.forEach((el: string) => {
            if (el === value) {
                temp[idx] = isNaN(temp[idx]) ? 1 : ++temp[idx]
            } else {
                if (isNaN(temp[idx])) {
                    temp[idx] = 0
                } else {
                    temp[idx + 1] = 0
                }
                idx++
            }
        })
        return Math.max.apply(null, temp)
    }

    public read(): void {
        fs.readFile(this.fileName, 'utf-8', (err: any, data: string) => {
            if (err) throw err
            console.log(data)
        })
    }
    public write(data: string): void {
        const number = this.getGameNumber()
        const log = `result ${data} game ${number}\n`
        fs.appendFile(this.fileName, log, (err: any) => {
            if (err) throw err
        })
    }
    public getStats(): void {
        const rl = readline.createInterface({
            input: fs.createReadStream(this.fileName)
        })
        rl.on('line', (line: string) => {
            line.split(' ').forEach(word => {
                if (word === 'true' || word === 'false') {
                    this.data.push(word)
                }
            })
        })
        rl.on('close', () => {
            this.stats.totalGames = this.data.length
            this.stats.totalWins = this.data.filter(value => value === 'true').length
            this.stats.totalLoses = this.data.filter(value => value === 'false').length
            this.stats.maxWinsSequence = this.checkSequence('true')
            this.stats.maxLosesSequence = this.checkSequence('false')
            this.stats.winRate = this.stats.totalLoses === 0 ? 100 : (this.stats.totalWins / this.stats.totalGames) * 100
            console.log(this.stats)
        })
    }
}