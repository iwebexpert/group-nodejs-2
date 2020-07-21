const fs = require('fs');
/**
 * Функционал просмотра логов в человекочитаемом виде
 */
module.exports = function showLog(logPath = `${__dirname}/logs/gamelog.json`) {
    let data = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    console.log(
        `Последний раз выпало: ${data.WhoWined === 1 ? `Орел` : `Решка`}\n`,
        `Орел выпал: ${data.FirstPlayerWins} раз\n`,
        `Решка выпала: ${data.SecondPlayerWins} раз\n`,
        `Проведено раундов: ${data.RoundsCount}\n`,
        `Орел выпал подряд:${data.FirstPlayerWinsInLine} раз\n`,
        `Решка выпала подряд:${data.SecondPlayerWinsInLine} раз\n`,
    );
}