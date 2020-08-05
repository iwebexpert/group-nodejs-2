const User = require('../models/user');
const router = require('express').Router();


router.get('/', (req, res) => {
    res.render('signup/signup');
});

router.post('/', async (req, res) => {
    const {repassword, ...restBody} = req.body;

    if (repassword === restBody.password) {
        const user = new User(restBody);
        await user.save();
        return res.redirect('/auth')
    }
    res.redirect('/signup?err=repass')
})

module.exports = router;