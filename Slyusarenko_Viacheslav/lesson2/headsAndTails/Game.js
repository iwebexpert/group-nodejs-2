const clc = require('cli-color');
const Logger = require('../logsAnalytics/Logger');

class HeadsAndTails {
  LOG_FILE_DEFAULT = 'ht.log';

  COMMANDS = {
    Head: 'h',
    Tail: 't',
    Exit: 'q',
  };
  logFile = null;

  constructor( logFile = this.LOG_FILE_DEFAULT ) {
    this.logFile = logFile;
  }

  gameStop = false;
  secret = null;

  start() {
    this._setSecret();
    console.log( clc.yellow( `Enter "${ clc.red( this.COMMANDS.Head ) }" if your answer is "Head"`) );
    console.log( clc.yellow( `Or enter "${  clc.red( this.COMMANDS.Tail ) }" - if answer is "Tail"` ) );
    console.log( clc.yellow( `To exit enter "${ clc.red( this.COMMANDS.Exit ) }"` ) );
  }

  _setSecret() {
    const values = [ this.COMMANDS.Head, this.COMMANDS.Tail ];
    const index = Math.round( Math.random() * Math.floor(1) );

    this.secret = values[ index ];
  }

  checkAnswer = ( answer ) => {
    if ( !Object.values( this.COMMANDS ).includes( answer ) ) {
      console.log( clc.red( "Wrong Command!" ) );
      return;
    }

    const { Exit } = this.COMMANDS;
    if ( answer === this.COMMANDS.Exit ) {
      this.gameStop = true;
      return;
    }

    const isWin = answer === this.secret;
    const resultText = isWin? 'win' : 'lose'

    console.log(`You ${ resultText }!`)

    Logger.writeLog( this.logFile, resultText );
    console.log(`Game restart! to exit enter: "${ clc.red( Exit ) }"`);
    this._setSecret();
  }
}

module.exports = HeadsAndTails;