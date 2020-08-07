const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const UserModel = require('./models/user');

passport.use(
    new Strategy({usernameField: 'email'}, async (username, password, done) => {
        try {
            const user = await UserModel.findOne({email: username});
            if (!user) {
                return done(null, false);
            }

            if (!user.validatePassword(password)) {
                return done(null, false);
            }
            const plainUser = JSON.parse(JSON.stringify(user));
            delete plainUser.password;

            return done(null, plainUser)
        } catch (error) {
            console.log(error);
            return done(error, false);
        }
    })
)

passport.serializeUser((user, done) => {
    done(null, user._id);
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id);
        if (!user) {
            return done(null, false);
        }
        const plainUser = JSON.parse(JSON.stringify(user));
        delete plainUser.password;

        return done(null, plainUser);
    } catch (error) {
        return done(error, false)
    }
})

module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    authenticate: passport.authenticate('local', {
        successRedirect: '/tasks',
        failureRedirect: '/auth?error=1'
    }),
    mustBeAuthenticated: (req, res, next) => {
        if (req.user) {
            next()
        } else {
            res.redirect('/auth')
        }
    }
}