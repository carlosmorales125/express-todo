import express from 'express';
import Joi from 'joi';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import TodoList from '../models/TodoList';
import config from '../config';

const router = express.Router();
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

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secret;
passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
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

router.post('/createuser', (req, res) => {
    const schema = {
        name: Joi.string().min(2).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            // Grab variables from request body
            const { name, email, password } = req.body;

            // Make sure no other users have entered this email;
            User.findOne({email: email})
                .then(user => {
                if (user) {
                    res.status(409).send('Email already exists');
                } else {
                    // init new user
                    let newUser = new User({
                        name: name,
                        email: email,
                        password: password,
                        token: 'fakefornow'
                    });
                    newUser
                        .save()
                        .then(user => {
                            //create the user's first todo list
                            let newTodoList = new TodoList({
                                userId: user._id
                            });
                            newTodoList
                                .save()
                                .then(() => {
                                    res.sendStatus(200);
                                })
                                .catch(err => {
                                    res.status(500).send(err);
                                });
                        })
                        .catch(err => {
                            res.status(500).send(err);
                        });
                }
            });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(400).send(err);
        }
        req.login(user, {session: false}, err => {
            if (err) {
                res.status(500).send(err);
            }

            const token = jwt.sign(user.toJSON(), config.secret, {
                expiresIn: 86400
            });

            const _id = user.get('_id');

            User.updateOne({_id: _id}, { $set: { token: token } })
                .then(() => {
                    // everything but the password
                    let userObject = {
                        _id: _id,
                        name: user.get('name'),
                        email: user.get('email'),
                        token: token
                    };

                    return res.json(userObject);
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        });
    })(req, res);
});

router.post('/changename', passport.authenticate('jwt', { session: false }), (req, res) => {
    const schema = {
        description: Joi.string().min(2).required(),
        id: Joi.string().min(6).required()
    };

    Joi.validate(req.body, schema)
        .then(() => {
            const { name, id } = req.body;

            User.updateOne({
                _id: id
                },
                {
                    $set: { name: name }
                })
                .then(() => {
                    User.findOne({ _id: id })
                        .then(user => {
                            // everything but the password
                            let userObject = {
                                _id: user.get('_id'),
                                name: user.get('name'),
                                email: user.get('email'),
                                token: user.get('token')
                            };
                            res.status(200).json(userObject);
                        })
                        .catch(err => {
                            res.status(500).send(err);
                        });
                })
                .catch(err => {
                    res.status(500).send(err);
                });
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

export { router as usersRouter };
