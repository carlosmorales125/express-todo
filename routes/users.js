var express = require('express');
var router = express.Router();
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var Joi = require('joi');
var User = require('../models/User');
var TodoList = require('../models/TodoList');

passport.use(new LocalStrategy(function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
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
                        password: password
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
                                    res.send(user);
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

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function (req, res) {
        res.sendStatus(200);
});

module.exports = router;
