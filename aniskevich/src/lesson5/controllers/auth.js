const passport = require('passport')
const Strategy = require('passport-local').Strategy

const User = require('../models/user')

passport.use(
    new Strategy({usernameField: 'email'}, async (username, password, done) => {
        const user = await User.findOne({email: username})
        if (!user) {
            return done(null, false)
        }
        if (!user.validatePassword(password)) {
            return done(null, false)
        }
        const plainUser = JSON.parse(JSON.stringify(user))
        delete plainUser.password
        done(null, plainUser)
    })
)

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    const plainUser = JSON.parse(JSON.stringify(user))
    delete plainUser.password
    done(null, plainUser)
})

module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    authenticate: passport.authenticate('local', {
        successRedirect: '/tasks',
        failureRedirect: '/login?error=Wrong credentials',
    }),
    checkAuth: (req, res, next) => {
        if (req.user) {
            next()
        } else {
            res.redirect('/login')
        }
    }
}