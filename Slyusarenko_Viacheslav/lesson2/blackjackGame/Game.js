/*
         Написать консольную игру "Орел или решка", в которой надо будет
    угадывать выпадающее число (1 или 2). В качестве аргумента
    программа может принимать имя файла для логирования
    результатов каждой партии.

        В качестве более продвинутой версии
    задания можете реализовать простейшую версию игры Blackjack.
*/
const { keys } = Object;

const clc = require('cli-color');
const { EventEmitter } = require('events');
const Logger = require('../logsAnalytics/Logger');

/** константы которые используются для игры */
const { COMMANDS, LOG_FILE, CARTS_COUNT, USER, CPU, NO_WINNERS, MIDDLE_VALUE, VALUE_MAX, CARDS } = require('./constants');

class BlackJackGame extends EventEmitter {
  /** признак начала игры */
  gameStart = false;
  /** цвета для игроков */
  colors = { [USER]: 'green', [CPU]: 'blue' };

  /** колода карт */
  cards = CARDS;
  /** Игроки и их карты */
  players = { [USER]: [], [CPU]: [] };

  gameStop = false;
  logFile = null

  constructor( logFile = LOG_FILE ) {
    super();
    this.logFile = logFile;
    this.cardsNames = keys( this.cards );

    this.on('gameEnd', (props) => {
      const { file, winner } = props;

      let msg = 'win';
      if ( (winner !== USER) ) {
        msg = (winner === NO_WINNERS) ? NO_WINNERS: 'lose';
      }
      this.gameStop = true;
      Logger.writeLog( this.logFile, msg );
    });
  }
    /** Игровой процесс */
  start() {
    BlackJackGame.showRules();
  }
  checkAnswer = ( cmd ) => {
    const { START, EXIT, PASS, TAKE_CARD, MY_CARDS } = COMMANDS;
    switch (cmd) {
      case START: {
        return this.gamePrepare();
      }
      case MY_CARDS: {
        return this.showCardsToPlayer();
      }
      case TAKE_CARD: {
        if ( !this.gameStart ) {
          return this.gamePrepare();
        }
        this.addCardToPlayer( USER );
        this.checkCards(USER);
        return;
      }
      case PASS: {
        return this.cpuInit();
      }
      case EXIT: {
        this.gameStop = true;
        return;
      }
      default: {
        BlackJackGame.print('Your command in invalid!', 'red');
        return BlackJackGame.showRules();
      }
    }
  }

  /** Начало игры, раздача  карт, и вскрытие карты компьютера */
  gamePrepare() {
    const playersList = keys(this.players);

    BlackJackGame.print('\tGame Start. Cards is given to players', 'red');
    this.gameStart = true;
    this.giveCardsToPlayers(playersList);

    this.showOneCardFromCpu();
  }
  /** Раздача рандомных карт игрокам */
  giveCardsToPlayers(playersList) {
    for ( let i = 0; i < CARTS_COUNT; i++ ) {
      playersList.forEach( player => {
          this.addCardToPlayer(player);
      });
    }
  }
  /** Простая логика робота */
  cpuInit() {
    const chance = this.getRandomNumber(1);
    let value = this.getPlayerCardsSum( CPU );
    let take = ( value < MIDDLE_VALUE || value === MIDDLE_VALUE && chance );
    let gameBegin = true;

    while(take) {
      value += this.addCardToPlayer(CPU);
      gameBegin = this.checkCards(CPU);
      take = ( value < MIDDLE_VALUE || value === MIDDLE_VALUE && chance );
    }
    /** криво завязал логику, поэтому нужен признак что игра еще идет и просто компьютер нажал пасс */
    if (gameBegin) {
      this.showAllCards();
    }
  }
  /** Вскрытие карт и определение победителя */
  showAllCards() {
    const userValue = this.getPlayerCardsSum(USER);
    const cpuValue = this.getPlayerCardsSum(CPU);
    const isDraw = ( userValue === cpuValue );

    let winner = NO_WINNERS;

    if ( !isDraw ) {
      winner = ( userValue < cpuValue) ? CPU :  USER ;
    }
    this.setWinner( winner );
  }
  /**
   * Обьявление победителя и завершение игры
   * @param winner
   **/
  setWinner(winner) {
    /** данный лог очень удобный для информирования результатов игры */
    console.log({
     user: this.getPlayerCardsSum( USER ),
     cpu: this.getPlayerCardsSum( CPU )
    });

    if ( winner === NO_WINNERS ) {
      BlackJackGame.print(`${ winner }! No winners`);
    } else {
      BlackJackGame.print(`${ this.setUserText(winner) } is win!`);
    }

    this.emit('gameEnd', { file: LOG_FILE, winner  });
  }
    /** Показать рандомную карту у компьютера */
    showOneCardFromCpu() {
      const randomCard = this.getRandomNumber( 1 );
      const { card } = this.players[ CPU ][ randomCard ];
      this.printMessageWithActiveUser( CPU, `show his card! it is ${ clc.red( card ) }`)
    }
    /** Метод помощник просмотра своих карт, + показывает сумму, для упрощение процесса игры */
    showCardsToPlayer() {
      const cards = this.players[ USER ];
      const userCards = cards.map( ({ card }) => card );
      const msg = clc.red( userCards.join(', ') || 'empty' );
      const totalSum = this.getPlayerCardsSum( USER );

      this.printMessageWithActiveUser( USER, `cards is ${ msg } value ${ totalSum } `);
    }
    /**
     * Получить сумму карт у игрока
     * @param player
     **/
    getPlayerCardsSum(player) {
      const cards = this.players[ player ];
      return cards.reduce((acc, { value } ) => value + acc, 0);
    }
    /**
     * Добавить карту игроку
     * @param player
     **/
    addCardToPlayer = (player) => {
      const length = this.cardsNames.length;
      const randomCard = this.cardsNames[ this.getRandomNumber( length - 1 ) ];
      const { value } = this.cards[ randomCard ];
      this.cards[ randomCard ].count--;

      if ( !this.cards[randomCard].count ) {
          delete this.cards[ randomCard ];
      }
      this.players[player].push( { card: randomCard, value } );

      if ( player === USER ) {
          BlackJackGame.print(`You take ${ randomCard }`);
      }
      return value
    };
    /**
     * Проверка на перебор, или 21
     * @param player
     **/
    checkCards( player ) {
      const value = this.getPlayerCardsSum(player);
      if ( value > VALUE_MAX ) {
          const playersList = keys( this.players );
          const winner = playersList.find((key) => key !== player );
          return this.setWinner( winner );
      } else if ( value === VALUE_MAX ) {
          return this.setWinner( player );
      }
      return true;
    }

    getRandomNumber (max) {
      return Math.round( Math.random() * Math.floor(max))
    }

    /** Установка цвета имени игрока перед выводом в консоль
     * @param { string } player игрок
     **/
    setUserText(player) {
      const key = this.colors[ player ];
      const cliMethod = clc[ key ];

      return cliMethod( player );
    }
    /**
     * Вывод сообщения в консоль
     * @param { string } msg текст сообщения
     * @param { string|null } style стиль если нужен ( ключь метода cli-color )
     **/
  static print(msg, style = null ) {
    const printMethod = clc[ style ] || clc.yellow;
    console.log( `${ printMethod( msg ) }` );
  }
  /**
   * Написать сообщение с указанием игрока
   * @param { string } user
   * @param { string } msg
   **/
  printMessageWithActiveUser(user, msg) {
    BlackJackGame.print(`${ this.setUserText( user ) } ${ msg }`);
  }
  /** Вывод правил игры ( управление ) */
  static showRules() {
    const { START, EXIT, PASS, TAKE_CARD, MY_CARDS } = COMMANDS;

    BlackJackGame.print(`To start BlackJackGame enter ${ clc.red( START ) }`, 'blue');
    BlackJackGame.print(`In game press ${ clc.red( TAKE_CARD ) } to take card, or ${ clc.red( PASS ) } to pass.`, 'blue' );
    BlackJackGame.print(`To see your cards enter ${ clc.red( MY_CARDS ) }`, 'blue' );
    BlackJackGame.print(`To exit game enter ${ clc.red( EXIT ) }`, 'blue');
  }
}

module.exports = BlackJackGame;