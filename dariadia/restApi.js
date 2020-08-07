const express = require("express");
const cors = require("cors"); //TODO
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("./config");

const SECRET_KEY = config.bearerToken;

mongoose.connect(`mongodb://localhost:${config.mongoosePort}/todo`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const taskModel = require("./models/task");
const userModel = require("./models/user");
const passport = require("./auth");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//Middleware для авторизации
const checkAuth = (req, res, next) => {
  if (req.headers.authorization) {
    const [type, token] = req.headers.authorization.split(" ");

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send();
      }

      req.user = decoded;
      next();
    });
  } else {
    return res.status(403).send();
  }
};

app.use("/tasks", checkAuth);

//Методы для обработки запросов
app.get("/tasks", async (req, res) => {
  const tasks = await taskModel.find({}).lean();
  res.status(200).json(tasks);
});

app.post("/tasks", async (req, res) => {
  if (!req.body) return res.sendStatus(400);

  const task = new taskModel(req.body);
  const isSaved = await taskModel.save();

  res.status(200).json(isSaved);
});

app.get("/tasks/:id", async (req, res) => {
  if (!req.params) return res.sendStatus(400);

  const { id } = req.params;
  const task = await taskModel.findById(id);
  res.status(200).json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  if (!req.params) return res.sendStatus(400);
  const { id } = req.params;

  await taskModel.findByIdAndDelete({ _id: id }, function (err, task) {
    if (err) return console.log(err);
  });

  res.redirect("/tasks");
});

app.patch("/tasks/:id", async (req, res) => {
  if (!req.params || !req.body) return res.sendStatus(400);

  const { id } = req.params;
  const { title, status, priority } = req.body;
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

//Для авторизации и регистрации
app.post("/register", async (req, res) => {
  const { repassword, ...restBody } = req.body;
  if (restBody.password === repassword) {
    const user = new userModel(restBody);
    await user.save();
    res.status(201).send();
  } else {
    res.status(400).json({ message: "User exists!" });
  }
});

app.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(401).send();
  }

  if (!user.validatePassword(password)) {
    return res.status(401).send();
  }

  const plainUser = JSON.parse(JSON.stringify(user));
  delete plainUser.password;

  res.status(200).json({
    ...plainUser,
    token: jwt.sign(plainUser, SECRET_KEY),
  });
});

app.listen(config.webPort, () => {
  console.log("The server has been started!");
});
