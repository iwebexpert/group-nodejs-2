const router = require('express').Router();
const User = require('../../models/user');
const jwt = require('jsonwebtoken');
const SECRET_KEY = require('../../config').SECRET_KEY

router.get('/', (req, res) => {
    res.render('auth/apiLogin')
})

router.post('/', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
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

    } catch (error) {
        console.log(error);
        res.status(401).json({message: 'Authorization error!'})
    }
})


module.exports = router;