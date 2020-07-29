const https = require("https");
// const https = require("http"); - для работы со старыми сайтами

https
  .get("https://geekbrains.ru", (res) => {
    console.log(`Response code: ${res.statusCode}`);

    let data = "";
    res.setEncoding("utf-8");

    res.on("data", (chunk) => {
      console.log(chunk);
      data += chunk;
    });

    res.on("end", () => {
      console.log(`Finish! Data: ${data}`);
    });
  })
  .on("error", (err) => {
    console.log(`Error: ${err}`);
  });
