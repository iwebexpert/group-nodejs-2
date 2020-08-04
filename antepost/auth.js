const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const User = require('./models/UserMongo');

passport.use(
    new Strategy({ usernameField: 'email' }, async (username, password, done) => {
        const user = await User.findOne({ email: username });

        if (!user) {
            return done(null, false);
        }

        if (!user.validatePassword(password)) {
            return done(null, false);
        }

        const plainUser = JSON.parse(JSON.stringify(user));

        delete plainUser.password;

        done(null, plainUser);
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    const plainUser = JSON.parse(JSON.stringify(user));
    delete plainUser.password;

    done(null, plainUser);
});

module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    authenticate: passport.authenticate('local', {
        successRedirect: '/tasks',
        failureRedirect: '/auth?err=wrond-credentials',
    }),

    mustBeAutheticated: (req, res, next) => {
        if (req.user) {
            req.app.locals.email = req.user.email;
            next();
        } else {
            res.redirect('/auth');
        }
    },
};
