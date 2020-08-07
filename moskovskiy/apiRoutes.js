const router = require('express').Router();

router.get('/', (req, res) => {
    res.redirect('/tasks/list')
})

//Работа с задачами
router.get('/tasks/list', (req, res) => {
    res.render('tasks/apiIndex');
})
router.use('/tasks', require('./controllers/api/tasksController'));

//Регстрация
router.use('/signup', require('./controllers/api/signupController'));

//Аутентификация
router.use('/auth', require('./controllers/api/authController'));


module.exports = router;