const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//eventEmitter
rl.on("line", (cmd) => {
  console.log(`You entered: ${cmd}`);

  if (cmd === "exit") {
    rl.close();
  }
});
