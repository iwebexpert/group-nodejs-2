const express = require("express");
const fs = require("fs");
const path = require("path");
const handlebars = require("express-handlebars");
const taskModel = require("./components/model/taskModel");
const userModel = require("./components/model/uesrModel");
const app = express();

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/components/view/"));
app.engine(
	"handlebars",
	handlebars({
		extname: ".hbs",
		defaultLayout: "main",
		partialsDir: path.join(app.get("views"), "partials"),
		layoutDir: path.join(app.get("views"), "layouts"),
	})
);
//Middleware для работы с form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
	res.render("main");
});
app.listen(4000, () => {
	console.log("The server has been started!");
});
