const User = require('../models/user');
const router = require('express').Router();
const passport = require('../auth');


router.get('/', (req, res) => {
    const { error } = req.query;
    res.render('auth/login', { error });
});

router.post('/', passport.authenticate)

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth');
})
module.exports = router;