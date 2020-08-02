/**
 *     Создать переводчик слов с английского на русский, который будет
 *   обрабатывать входящие GET запросы и возвращать ответы,
 *   полученные через API Яндекс.Переводчика. 
 **/
const clc = require('cli-color');
const { createInterface } = require('readline');
const Translate = require('./Translate');

const COMMAND_EXIT = '-q';

const AVAILABLE_LANGUAGES = [
   { command: '-r', code: 'en-ru', desc: 'перевод на русский язык' },
   { command: '-e', code: 'ru-en', desc: 'перевод на английский язык' }
];

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const translate = new Translate( AVAILABLE_LANGUAGES );

console.log( `Для выхода введите ${ clc.green( COMMAND_EXIT) }`);

rl.on('line', ( cmd ) => {

    if ( !cmd.trim() ) {
        console.log( 'Строка для перевода не должна быть пустой!' );
        return;
    } else if ( translate.isChangeLangCommand( cmd ) ) {
        translate.setTargetLang( cmd );
        return;
    } else if ( cmd === COMMAND_EXIT ) {
        return rl.close();
    }
    translate.setText( cmd ).getTranslate();
});