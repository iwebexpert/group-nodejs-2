/**
 *     Сделать программу-анализатор игровых логов. В качестве
 * аргумента программа получает путь к файлу. Выведите игровую
 * статистику: общее количество партий, количество выигранных /
 * проигранных партий и их соотношение, максимальное число побед /
 * проигрышей подряд
 *
 **/
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFilePromisify = promisify( fs.readFile );

class Logger {
  static LOGS_PATH = path.resolve( __dirname );

  handleError = (err) => {
    if ( !err ) {
      return;
    }
    console.log( err );
  };

  /** записать в лог */
  writeLog(file, content, callBack = null ) {
    const filePath = path.join( Logger.LOGS_PATH, file );
    fs.readFile( filePath, 'utf-8', (err, data) => {
      const fileNotFound = (err && err.code === 'ENOENT');
      let logValue;

      if ( !fileNotFound ) {
        const logData = JSON.parse(data);
        logValue = [...logData, content ];
      } else {
        logValue = [ content ];
      }
      fs.writeFile( filePath, JSON.stringify(logValue), callBack || this.handleError);
    });
  }
  /** прочитать лог файл */
  static readLog( file ) {
    return readFilePromisify(file, 'utf-8');
  }
  /** запустить анализ лог файла */
  analyze( logFile ) {
    const filePath = path.join( Logger.LOGS_PATH, logFile );
    Logger.readLog( filePath )
      .then(data => {
        const stats = JSON.parse(data);
        this.showStatistics( stats );
      })
      .catch( (err) => {
        if ( err.code === 'ENOENT') {
          console.log('Statistics is Empty');
          return;
        }
        console.log('File system Error: ', err );
      });
  }
  /** статистика игры */
  showStatistics( data ) {
    console.log( this.calculateStatistics( data ) );
  }
  /** подготовка информации о игре */
  calculateStatistics = ( data ) => {
    const counters = { maxWin: 0, maxLose: 0, winTricks: 0, loseTricks: 0 };

    const statistics = data.reduce( ( {  wins, loses, ...restAcc }, result) => {
      const isWin = ( result === 'win' );
      const isDraw = ( result === 'draw' );

      counters.maxWin = isWin ? counters.maxWin + 1 : 0;
      counters.maxLose = ( !isWin && !isDraw ) ? counters.maxLose + 1 : 0;

      counters.winTricks = ( counters.maxWin > counters.winTricks ) ? counters.maxWin : counters.winTricks;
      counters.loseTricks = ( counters.maxLose > counters.loseTricks) ? counters.maxLose : counters.loseTricks;

      if ( isDraw ) {
        const currentDraws = restAcc.draws || 0;
        restAcc.draws = currentDraws + 1;
      }

      return {
        ...restAcc,
        wins:  isWin ? wins + 1 : wins,
        loses: ( !isWin && !isDraw ) ? loses + 1 : loses,
      };
    }, { games: 0, wins: 0, loses: 0, });

    const gamesCount = data.length;

    return {
      ...statistics,
      games: gamesCount,
      winTricks: counters.winTricks,
      loseTricks: counters.loseTricks,
      winPercent: ( statistics.wins / gamesCount ) * 100,
      losePercent: ( statistics.loses / gamesCount ) * 100,
    };
  }
}

const logger = new Logger();
module.exports = logger;