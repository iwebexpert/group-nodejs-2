const argv = require('minimist')(process.argv);
const BlackJackGame = require( './Game' );
const { rl } = require('../system');
const game = new BlackJackGame( argv.f || argv.file );

game.start();

rl.on('line', ( cmd ) => {
  game.checkAnswer( cmd );

  if (game.gameStop) {
    rl.close();
  }
});