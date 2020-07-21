const fs = require("fs");

/**
 * Вся игра AHTUNG - так уж сложилось - днем писать некогда, а ночью не могу - тут осталось взаимодействие с пользователем запилить через консоль, пока в разработке
 */
class Game {

    /**
     * Проверяем есть ли файл лога и если его нет создаем
     */
    constructor() {
        this.log = !fs.existsSync(`${__dirname}/logs/gamelog.json`) ? (() => {
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
    step(min = 1, max = 2) {
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
        previousResults.WhoWined = this.step();
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
}

module.exports = new Game();