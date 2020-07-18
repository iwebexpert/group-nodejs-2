console.log(process.argv);

const minimist = require("minimist");

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: "help",
  },
});

console.log(argv);
