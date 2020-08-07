const http = require("http");
const url = require("url");

const message = {
  name: "Anna",
  text: "Hello!!",
};

http
  .createServer((req, res) => {
      console.log(req.url)
    const query = url.parse(req.url, true);
    console.log(query)

    res.writeHead(200, {
      "Content-Type": "application/json",
    });

    res.write(JSON.stringify(message));
    res.end();
  })
  .listen(4000, () => {
    console.log("Server is running on port: 4000!");
  });
