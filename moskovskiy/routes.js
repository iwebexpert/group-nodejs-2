const router = require('express').Router();

//Работа с задачами
router.use('/tasks', require('./controllers/tasksController'));

//Регистрация
router.use('/signup', require('./controllers/signupController'));

//Аутентификация
router.use('/auth', require('./controllers/loginController'));

module.exports = router;