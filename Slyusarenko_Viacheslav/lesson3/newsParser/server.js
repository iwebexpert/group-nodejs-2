/**
 *  1) Создать программу для получения информации о последних
 *  новостей с выбранного вами сайта в структурированном виде
 **/
const clc = require('cli-color');
const request = require('request');
const { createServer } = require('http');

const Parser = require('./Parser');

/** порт нашего приложения */
const PORT = 3000;
/** url адресс нашего приложения */
const SERVER_URL = 'http://localhost';

/** url адресс сайта с новостями */
const PARSE_URL = 'https://jsfeeds.com';

/** константы для парсинга данных */
const MAIN_SELECTOR = '.article_body .row'; 
const PARAMS_SELECTOR = [
  { selector: 'h3 a', key: 'title' },
  { selector: '.col-md-6 a>img', key: 'img'},
  { selector: '.col-md-18', key: 'body' },
];

const server = createServer( (req, res) => 
  request( PARSE_URL, (error, response, html) => {
    res.writeHeader( 200, { 'Content-Type': 'text/html' } );
    if ( !error && response.statusCode === 200 ) {
      const parser = new Parser( html, MAIN_SELECTOR, PARAMS_SELECTOR );
      res.write( parser.getNews() );
    } else {
      res.write( 'Server is unavailable! Please try again later' );
    }
    res.end();
  })
).listen( PORT );

/**  просто подсказка что сервер запустился, и на каком порту */
server.on( 'listening' , () => console.log([
    clc.yellow(`==================== Server start ====================`),
    clc.green(`\t${ SERVER_URL }:${ PORT }`)
  ].join('\n')
));