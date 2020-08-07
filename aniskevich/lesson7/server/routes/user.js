const express = require('express')

const UserController = require('../controllers/user')
const passport = require('../controllers/auth')

const router = express.Router()

router.post('/registration', UserController.registration)
router.post('/login', UserController.login)

module.exports = router