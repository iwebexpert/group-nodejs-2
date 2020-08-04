const User = require('../models/user')

registrationForm = (req, res) => {
    const { error } = req.query
    res.render('registration', {error})
}

registration = async (req, res) => {
    const { repassword, ...rest } = req.body
    if (rest.password === repassword) {
        const user = new User(rest)
        await user.save().catch(err => res.redirect(`/registration?error=${err.message}`))
        res.redirect('/login')
    } else {
        res.redirect('/registration?error=Passwords dont match')
    }
}

loginForm = (req, res) => {
    const { error } = req.query
    res.render('login', {error})
}

logout = (req, res) => {
    req.logout()
    res.redirect('/login')
}

module.exports = {
    registrationForm,
    registration,
    loginForm,
    logout,
}