const { response } = require("express");

/**
 * Подключаем зависимости
 */
const [fs, request, path, express, consolidate, handlebars, cherrio] = [require("fs"), require("request"), require("path"), require("express"), require("consolidate"), require("handlebars"), require("cheerio")];
const app = express();
/**
 * Шаблонизация
 */
app.engine("hbs", consolidate.handlebars);
app.set("view engine", "hbs");
app.set("views", path.resolve(__dirname, "view"));
/**
 * Header и Footer - регистрация частей
 */
// TODO: Не нравится - больше похоже на костыль - объясните как сделать лучше - ведь могут быть нужны шаблоны из глубины вложенности view - то есть не из корня
const HEADER = handlebars.compile(fs.readFileSync(__dirname + "/view/common/header.hbs").toString("utf-8"));
const FOOTER = handlebars.compile(fs.readFileSync(__dirname + "/view/common/footer.hbs").toString("utf-8"));
handlebars.registerPartial("header", HEADER);
handlebars.registerPartial("footer", FOOTER);
/**
 * URL и порт сервера
 */
const SERVER_URL = "http://localhost";
const PORT = 8080;
/**
 * Middleware для работы с form
 */
app.use(express.urlencoded({ extended: false }));
/**
 * Middleware для работы JSON
 */
app.use(express.json());

/**
 * Список новостей
 */
const NEWS_URL = `https://journal.bookmate.com`;
let newsCount = null;
app.post("/", (req, res, next) => {
	newsCount = req.body.newscount;
	// TODO: Приходится с формы редиректить в ручную, даже если как action я укажу /newsfeed есть ли лучшее решение ? + тут ошибка в консоли - как избежать
	res.redirect("/newsfeed");
	// res.send(''); не делать next или send что-ли, как-то это не нравится
	// next(); не делать next или send что-ли, как-то это не нравится
});
/**
 * Главная страница
 */
app.get("/", (req, res) => {
	// TODO: Вопрос: Есть ли в таком методе next и если да, когда он нужен в реальной жизни
	res.render("mainpage", { documentTitle: `Главная страница`, pagetitle: `Главная` });
});
/**
 * Newsfeed
 */
app.get("/newsfeed", (req, res) => {
	request(NEWS_URL, (err, response, body) => {
		if (!err && response.statusCode === 200) {
			const $ = cherrio.load(body);
			// TODO: Возможно есть более изящный способ собрать newsItems
			let newsItems = [];
			$(".pitem").each((index, item) => {
				/**
				 * Если число новостей больше введенного числа - прекращаем их собирать
				 */
				if (newsCount && index >= newsCount) {
					return false;
				}
				newsItems[index] = {
					srcimage: /^https?.*/i.test($(item).find("img").attr("src")) ? $(item).find("img").attr("src") : NEWS_URL + $(item).find("img").attr("src"),
					title: $(item).find(".ititle").text(),
					detailLink: NEWS_URL + $(item).attr("href"),
				};
			});
			res.render("newsfeed", { documentTitle: "Список новостей", pagetitle: "Новости", news: newsItems });
		}
	});
});

/**
 * Страница не существует
 */
app.use("*", (req, res, next) => {
	// TODO: Не знаю на сколько уместна обработка ошибок таким образом - научите как правильно - пашет только если разместить внизу всех обработчиков
	// console.log(`########   Пытаюсь обработать 404  ########`);
	res.status(404).render("404", {});
	// console.log(`###########   Обработал   #########`);
	// TODO: Почему next ошибка
	// next();
});
/**
 *  Запуск сервера
 */
// TODO:  Вопрос: В чем отличие от ```http.createServer(app).listen(80)```
app.listen(PORT, () => {
	console.log(`##########   The server was started on: ${SERVER_URL}:${PORT}   ##########`);
});
