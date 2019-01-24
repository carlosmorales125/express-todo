import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import User from './models/User';
import config from './config';

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    (email, password, done) => {
        User.findOne({ email: email }, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (!user.verifyPassword(password)) {
                return done(null, false);
            }

            return done(null, user);
        });
    }
));

const jwtOpts = {};
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOpts.secretOrKey = config.secret;

passport.use(new JwtStrategy(jwtOpts, (jwt_payload, done) => {
    User.findOne({id: jwt_payload.sub}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));
