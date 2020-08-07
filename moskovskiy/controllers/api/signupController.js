const User = require('../../models/user');
const router = require('express').Router();

router.post('/', async (req, res) => {
    const {repassword, ...restBody} = req.body;
    try {
        if (repassword === restBody.password) {
            const user = new User(restBody);
            await user.save();
            return res.status(201).send(true);
        }
        res.status(400).json({message: 'Passwords don\'t match'})
    } catch (error) {
        res.status(400).json({message: 'Unable to register user!'})
    }
})

module.exports = router;