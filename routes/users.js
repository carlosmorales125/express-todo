var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Joi = require('joi');
var User = require('../models/User');
var TodoList = require('../models/TodoList');

var jwt = require('jsonwebtoken');
var config = require('../config');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        User.findOne({ email: email }, function (err, user) {
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

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secret;
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.sub}, function(err, user) {
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

router.post('/createuser', function(req, res) {
    var schema = {
        name: Joi.string().min(2).required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    };

    Joi.validate(req.body, schema)
        .then(function () {
            // Grab variables from request body
            var name = req.body.name;
            var email = req.body.email;
            var password = req.body.password;

            // Make sure no other users have entered this email;
            User.findOne({email: email})
                .then(function (user) {
                if (user) {
                    res.status(409).send('Email already exists');
                } else {
                    // init new user
                    var newUser = new User({
                        name: name,
                        email: email,
                        password: password,
                        token: 'fakefornow'
                    });
                    newUser
                        .save()
                        .then(function (user) {
                            //create the user's first todo list
                            var newTodoList = new TodoList({
                                userId: user._id
                            });
                            newTodoList
                                .save()
                                .then(function () {
                                    res.sendStatus(200);
                                })
                                .catch(function (err) {
                                    res.status(500).send(err);
                                });
                        })
                        .catch(function (err) {
                            res.status(500).send(err);
                        });
                }
            });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
});

router.post('/login', function (req, res) {
    passport.authenticate('local', { session: false }, function (err, user) {
        if (err || !user) {
            return res.status(400).send(err);
        }
        req.login(user, {session: false}, function(err) {
            if (err) {
                res.status(500).send(err);
            }

            var token = jwt.sign(user.toJSON(), config.secret, {
                expiresIn: 86400
            });

            var _id = user.get('_id');

            User.updateOne({_id: _id}, { $set: { token: token } })
                .then(function () {
                    // everything but the password
                    var userObject = {
                        _id: _id,
                        name: user.get('name'),
                        email: user.get('email'),
                        token: token
                    };

                    return res.json(userObject);
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        });
    })(req, res);
});

router.post('/changename', passport.authenticate('jwt', { session: false }), function (req, res) {
    var schema = {
        description: Joi.string().min(2).required(),
        id: Joi.string().min(6).required()
    };

    Joi.validate(req.body, schema)
        .then(function () {
            var name = req.body.description;
            var id = req.body.id;

            User.updateOne({
                _id: id
                },
                {
                    $set: { name: name }
                })
                .then(function () {
                    User.findOne({ _id: id })
                        .then(function (user) {
                            // everything but the password
                            var userObject = {
                                _id: user.get('_id'),
                                name: user.get('name'),
                                email: user.get('email'),
                                token: user.get('token')
                            };
                            res.status(200).json(userObject);
                        })
                        .catch(function (err) {
                            res.status(500).send(err);
                        });
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
});

module.exports = router;
