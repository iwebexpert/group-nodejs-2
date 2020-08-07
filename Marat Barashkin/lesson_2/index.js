const fs = require('fs');
const readLine = require('readline');
const showLog = require('./showLog');

/**
 * Вся игра
 */
class Game {

    /**
     * Проверяем есть ли файл лога и если его нет создаем
     */
    constructor() {
        this.log = !fs.existsSync(`${__dirname}/logs/gamelog.json`) ? (() => {
            !fs.existsSync(`${__dirname}/logs/`) ? fs.mkdirSync(`${__dirname}/logs/`) : '';
            fs.writeFileSync(`${__dirname}/logs/gamelog.json`, JSON.stringify({
                'WhoWined': 0,
                'FirstPlayerWins': 0,
                'SecondPlayerWins': 0,
                'RoundsCount': 0,
                'FirstPlayerWinsInLine': 0,
                'SecondPlayerWinsInLine': 0
            }), 'utf-8');
            return `${__dirname}/logs/gamelog.json`;
        })() : `${__dirname}/logs/gamelog.json`;
        this.interface = readLine.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        this.gameStarted = false;
        this.roundStarted = false;
        this.firstPlayerWins = 0;
        this.secondPlayerWins = 0;
        //Bind
        this.gameUserInterface.bind(this)
    }
    /**
     * Получаем содержимое лог файла
     * @returns {any}
     */
    getLog() {
        return JSON.parse(fs.readFileSync(this.log, 'utf8'));
    }

    /**
     * определяем как упала монетка случайным образом
     * @param max
     * @param min
     * @returns {number}
     */
    winnerDefinition(min = 1, max = 2) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }

    /**
     * Производим обработку и запись логов
     * @param whoWin
     * @param firstPlayerWins
     * @param secondPlayerWins
     * @param roundsCount
     * @param firstPlayerWinsInLine
     * @param secondPlayerWinsInLine
     */
    handleLogs(whoWin, firstPlayerWins, secondPlayerWins, roundsCount, firstPlayerWinsInLine, secondPlayerWinsInLine) {
        let roundResultsForLogging = (logPath = this.log, currentState = this.getLog()) => {
            return JSON.stringify(Object.assign(currentState, {
                'WhoWined': whoWin,
                'FirstPlayerWins': firstPlayerWins,
                'SecondPlayerWins': secondPlayerWins,
                'RoundsCount': roundsCount,
                'FirstPlayerWinsInLine': firstPlayerWinsInLine,
                'SecondPlayerWinsInLine': secondPlayerWinsInLine,
            }));
        }
        fs.writeFileSync(`${__dirname}/logs/gamelog.json`, roundResultsForLogging(), 'utf-8');
    }

    /**
     * Собственно сам процесс игры
     */
    play() {
        let previousResults = this.getLog();
        if (this.roundStarted) {
            previousResults.WhoWined = this.winnerDefinition();
            previousResults.WhoWined === 1 ? this.firstPlayerWins++ : this.secondPlayerWins++;
            console.log(`Выпадение: ${(previousResults.WhoWined === 1 ? `Орел` : `Решка`)}`);
            previousResults.WhoWined === 1 ? previousResults.FirstPlayerWins++ : previousResults.SecondPlayerWins++;
            previousResults.RoundsCount++;
            previousResults.FirstPlayerWinsInLine += previousResults.WhoWined === 1 ? 1 : 0;
            previousResults.SecondPlayerWinsInLine += previousResults.WhoWined === 2 ? 1 : 0;
            this.handleLogs(previousResults.WhoWined,
                previousResults.FirstPlayerWins,
                previousResults.SecondPlayerWins,
                previousResults.RoundsCount,
                previousResults.FirstPlayerWinsInLine,
                previousResults.SecondPlayerWinsInLine,);
        }
        if (this.firstPlayerWins >= 2 || this.secondPlayerWins >= 2) {
            this.roundStarted = !this.roundStarted;
            console.log(`Победитель: ${this.firstPlayerWins > this.secondPlayerWins ? 'Орел' : 'Решка'}`);
            this.gameUserInterface();
        }
    }

    gameUserInterface() {
        !this.gameStarted ? (() => {
            console.log(`Игра "орел и решка" играем до 3 попыток!`);
            this.gameStarted = !this.gameStarted;
            this.roundStarted = !this.roundStarted;
        })() : '';
        !this.gameStarted ? this.interface.close() : (() => {
            if (this.roundStarted) {
                for (let i = 0; i < 3; i++) {
                    this.roundStarted ? this.play() : '';
                }
            } else {
                console.log(`Играть снова? y/n\n`, `Просмотреть лог: l`);
                this.interface.on('line', (command) => {
                    switch (command) {
                        case 'y':
                            for (let i = 0; i < 3; i++) {
                                this.roundStarted ? this.play() : '';
                            }
                            break;
                        case 'n':
                            this.interface.close();
                            this.roundStarted = false;
                            this.gameStarted = false;
                            break;
                        case 'l':
                            showLog(this.log);
                            //Интересует как тут убрать listener который повесил в  118 строке
                            this.gameUserInterface();
                            break;
                        default:
                            console.log(`Не корректная команда`);
                            //Интересует как тут убрать listener который повесил в  118 строке
                            this.gameUserInterface();
                    }
                });
            }
        }).call(this); //call this нужен
    }
}

module.exports = new Game();