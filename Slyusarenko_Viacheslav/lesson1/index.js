const clc = require('cli-color');
const beeper = require('beeper');

const CLC_FUNCTIONS = {
  error: clc.red.bold,
  warn: clc.yellow,
  notice: clc.blue,
  success: clc.green
};

function rainbowMessage( message, colors, divider = "" ) {
   const parts = message.split(divider);
   let colorIndex = 0;
   const coloredMessage =  parts.reduce( ( acc, el ) => {
      colorIndex++;
      if ( colorIndex >= colors.length  ) {
        colorIndex = 0;
      }
      const fn = colors[ colorIndex ];
      return `${ acc }${ divider }${ fn( el ) }`;
  },"");

  console.log(  `${ coloredMessage } \n` );
}

function printLine( message, clcFunc = CLC_FUNCTIONS.notice, ) {
  console.log( clcFunc(  `${ message } \n` ) );
}

/**
 * Внимание! Использование beeper в VisualStudioCode через ее консоль, может не издавать звуков!!
 * В консоли PhpStrorm или через консоль PowerShel  -  все отлично, и воспроизводит звук, даже те сишгалы в виде "*"" и "-""
 **/
function doBeep() {
  beeper("*--*--*");
}

async function asyncBeep() {
  await setTimeout( doBeep, 1000);
}

printLine( "Hello", CLC_FUNCTIONS.error );

rainbowMessage("hello Colors", Object.values(CLC_FUNCTIONS) );

asyncBeep();