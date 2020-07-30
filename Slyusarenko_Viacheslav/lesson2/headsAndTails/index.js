const argv = require('minimist')(process.argv);

const headsAndTails = require( './Game' );
const { rl } = require('../system');
const game = new headsAndTails( argv.f || argv.file );

game.start();

rl.on('line', ( cmd ) => {
  game.checkAnswer( cmd );

  if (game.gameStop) {
    rl.close();
  }
});