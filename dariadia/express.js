const express = require("express");
const consolidate = require("consolidate");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const config = require("./config");

const app = express();

const taskModel = require("./models/task");
const userModel = require("./models/user");
const passport = require("./auth");

mongoose.connect(`mongodb://localhost:${config.mongoosePort}/todo`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.engine("hbs", consolidate.handlebars);
app.set("view engine", "hbs");
app.set("views", path.resolve(__dirname, "views"));

//Middleware для работы с form
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: "1234",
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
app.use(passport.initialize);
app.use(passport.session);

//Для работы с JSON
app.use(express.json());

//Проверка авторизации
app.use("/tasks", passport.mustBeAutheticated);

//Обработка запросов
app.get("/", (req, res) => {
  res.redirect("/tasks");
});

app.get("/tasks", async (req, res) => {
  const tasksHelper = await taskModel.find({});
  const tasks = [];
  for (let i of tasksHelper) {
    tasks.push({
      title: i.title,
      status: i.status,
      priority: i.priority,
      priorityKey: i.priority === "high" ? 1 : 0,
      id: i._id,
    });
  }
  res.render("tasks", { tasks });
});

app.post("/tasks", async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const task = new taskModel(req.body);
  await task.save();
  res.redirect("/tasks");
});

app.post("/tasks/update", async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { id, title, status, priority } = req.body;
  const task = await taskModel.findById(id);

  const updatedTask = {
    title: title ? title : task.title,
    status: status ? status : task.status,
    priority: priority ? priority : task.priority,
  };

  taskModel.updateOne({ _id: id }, updatedTask, { new: true }, function (
    err,
    task
  ) {
    if (err) return console.log(err);
  });

  res.redirect("/tasks");
});

app.post("/tasks/remove", async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { id } = req.body;

  await taskModel.findByIdAndRemove(id);
  res.redirect("/tasks");
});

app.post("/tasks/update", async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { id, title } = req.body;

  await taskModel.updateOne({ _id: id }, { $set: { title } });
  res.redirect("/tasks");
});

app.get("/tasks/:id", async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { id } = req.params;
  const task = await taskModel.findById(id);
  res.render("task", task);
});

//Registration/Auth
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  const { repassword, ...restBody } = req.body;
  if (restBody.password === repassword) {
    const user = new userModel(restBody);
    await user.save();
    res.redirect("/auth");
  } else {
    res.redirect("/register?err=repass");
  }
});

app.get("/auth", (req, res) => {
  const { error } = req.query;
  res.render("auth", { error });
});

app.post("/auth", passport.authenticate);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/auth");
});

app.listen(config.webPort, () => {
  console.log("The server has been started!");
});
