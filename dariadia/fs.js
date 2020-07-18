const fs = require("fs");

//Sync
// const data = fs.readFileSync('./env.js', 'utf-8')
// console.log(data)

//Async
// fs.readFile('./env.js', 'utf-8', (err, data) => {
//     if(err){
//         throw err
//     }

//     console.log('Async', data)
// })

fs.readFile("./env.js", (err, data) => {
  if (err) {
    throw err;
  }

  console.log("Async", data.toString());
});
