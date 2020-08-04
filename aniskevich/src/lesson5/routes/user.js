const express = require('express')

const UserController = require('../controllers/user')
const passport = require('../controllers/auth')

const router = express.Router()

router.get('/registration', UserController.registrationForm)
router.post('/registration', UserController.registration)
router.get('/login', UserController.loginForm)
router.post('/login', passport.authenticate)
router.get('/logout', UserController.logout)

module.exports = router