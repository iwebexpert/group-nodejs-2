const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const userModel = require('./models/user');

passport.use(
    new Strategy({usernameField: 'login'}, async (username, password, done) => {
        const model = new userModel();
        const user = await model.findOne({login: username})

        if (!user) {
            return done(null, false);
        }

        const match = await model.validatePassword(password, user.password);
        if (!match) {
            return done(null, false);
        }

        delete user.password;

        done(null, user);
    })
)

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    const model = new userModel();
    const user = await model.findOne({id});
    delete user.password;

    done(null, user);
})

module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    authenticate: passport.authenticate('local',
        { failureRedirect: '/signin?error=1' }
    ),


    mustBeAuthenticated: (req, res, next) => {
        if (req.user) {
            next();
        } else {
            res.redirect('/signin');
        }
    }
};