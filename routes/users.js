var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var passport = require('passport');
var Joi = require('joi');
var User = require('../models/User');
var TodoList = require('../models/TodoList');

router.post('/createuser', function(req, res, next) {
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
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(newUser.password, salt, function (err, hash) {
                            if (err) {
                                res.send(500).send('internal error');
                                throw err;
                            }
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(function (user) {
                                    //create the user's first todo list
                                    console.log('this is a new user', user);
                                    var newTodoList = new TodoList({
                                        userId: user._id
                                    });
                                    newTodoList
                                        .save()
                                        .then(function (todoList) {
                                            res.send(user);
                                        })
                                        .catch(function (err) {
                                            res.status(500).send(err);
                                        });
                                })
                                .catch(function (err) {
                                    res.status(500).send(err)
                                });
                        });
                    });
                }
            });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
});

router.post('/auth', function (req, res, next) {
    var schema = {
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required()
    };

    Joi.validate(req.body, schema)
        .then(function (value) {

        })
        .catch(function (err) {
            res.status(400).send(err);
        })
});

module.exports = router;
