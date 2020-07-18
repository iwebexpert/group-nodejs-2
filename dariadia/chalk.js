const chalk = require("chalk")
const usage = require("usage")

console.log(chalk.blue.bgRed.bold("Hello world!"))

console.log(chalk.keyword("orange")("Hello world! But in orange colored text"))
console.log(chalk.rgb(123, 45, 67).underline("Underlined"))
console.log(chalk.hex("#DEADED").bold("Bold gray!"))

let pid = 25119 // any process pid. This is Chrome on my machine
usage.lookup(pid, function (err, result) {
  if (!result) throw err

  const {
    cpu,
    memory,
    memoryInfo: { rss, vsize },
  } = result;
  
  console.log(chalk`
    CPU: {red ${cpu}}
    memory: {green ${memory}}
    memoryInfo (rss : vsize): {rgb(255,131,0) ${rss} : ${vsize} }
  `)
})
