const clc = require('cli-color');
const beeper = require('beeper');

const CLC_FUNCTIONS = {
  error: clc.red.bold,
  warn: clc.yellow,
  notice: clc.blue,
  success: clc.green
}

function rainbowMessage( message, colors, divider = "" ) {
   const parts = message.split("");
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
  beeper("*--*--*");
}

function printLine( message, clcFunc = CLC_FUNCTIONS.notice, ) {
  console.log( clcFunc(  `${ message } \n` ) );
  beeper("*--*--*");
}

/**
 * Внимание! Использование beeper в VisualStudioCode через ее консоль, может не издавать звуков!!
 * В консоли PhpStrorm или через консоль PowerShel  -  все отлично, и воспроизводит звук, даже те сишгалы в виде "*"" и "-""
 **/
async function asyncBeep() {
  await setTimeout( beeper, 1000);
};

printLine( "Hello", CLC_FUNCTIONS.error );

rainbowMessage("hello Colors", Object.values(CLC_FUNCTIONS) );

asyncBeep();