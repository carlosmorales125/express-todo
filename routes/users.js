var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const TodoList = require('../models/TodoList');

router.post('/createuser', function(req, res, next) {
    // Grab variables from request body
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    // Create Error Array
    var errors = [];

    // Todo: validate with joi or something else.
    // Validate data and create errors if not valid
    if (!name || !email || !password || !confirmPassword) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password !== confirmPassword) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        // lets send a message with errors
        res.status(400).send(errors);
    } else {
        // Make sure no other users have entered this emai;
        User.findOne({email: email}).then(function (user) {
            if (user) {
                errors.push({msg: 'Email already exists'});
                res.status(409).send(errors);
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
                                var newTodoList = new TodoList({
                                    userId: user._id
                                });
                                newTodoList
                                    .save()
                                    .then(function (todoList, user) {
                                        console.log(todoList);
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
    }
});

router.post('/auth', function (req, res, next) {
    
});

module.exports = router;
