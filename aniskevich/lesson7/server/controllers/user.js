const jwt = require('jsonwebtoken')

const User = require('../models/user')

const SECRET = '$uper$ecret$tring'

registration = async (req, res) => {
    const { repassword, ...rest } = req.body
    if (rest.password === repassword) {
        const user = new User(rest)
        await user
                .save()
                .then(() => {
                    const plainUser = JSON.parse(JSON.stringify(user))
                    delete plainUser.password
                    res.status(201).json({ success: true, user: plainUser, token: jwt.sign(plainUser, SECRET)})
                })
                .catch(error => res.status(400).json({success: false, error: error.message}))
    } else {
        res.status(400).json({success: false, error: 'Passwords dont match'})
    }
}

login = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        res.status(404).json({ success: false, error: 'User not found'})
    }
    if (!user.validatePassword(password)) {
        res.status(400).json({ success: false, error: 'Wrong password'})
    }
    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password
    res.status(200).json({ success: true, user: plainUser, token: jwt.sign(plainUser, SECRET)})
}

module.exports = {
    registration,
    login,
}