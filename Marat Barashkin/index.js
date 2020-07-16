let chalk = require('chalk');
let beeper = require('beeper');

 (async () => {
    await beeper();
    await new Promise((resolve)=>{
         setTimeout(()=>{resolve(console.log(chalk.blue.bgHex('#303845')('I always use the yarn package manager in my work\n')))},2000)
    });
    await beeper(2);
})();
 // Ну и хватит