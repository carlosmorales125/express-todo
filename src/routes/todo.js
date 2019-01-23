var express = require('express');
var Joi = require('joi');
var router = express.Router();
var TodoList = require('../models/TodoList');
var passport = require('passport');

router.get('/todolist/:userId', passport.authenticate('jwt', { session: false }), function (req, res) {
    var schema = {
        userId: Joi.string().min(3).required()
    };

    Joi.validate({userId: req.params.userId}, schema)
        .then(function () {
            var userId = req.params.userId;

            TodoList.find({ userId: userId })
                .then(function (list) {
                    res.json({
                        list: list
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

router.put('/addtask', passport.authenticate('jwt', { session: false }), function (req, res) {
    var schema = {
        userId: Joi.string().required(),
        description: Joi.string().min(3).required()
    };

    Joi.validate(req.body, schema)
        .then(function () {
            var userId = req.body.userId;
            var description = req.body.description;

            var newTask = {
                description: description,
                done: false
            };

            TodoList.updateOne({ userId: userId }, { $push: { todoList: newTask } })
                .then(function () {
                    res.sendStatus(200);
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
});

router.put('/edittodo', passport.authenticate('jwt', { session: false }), function (req, res) {
    var schema = {
        userId: Joi.string().required(),
        id: Joi.string().required(),
        description: Joi.string().min(3).required()
    };

    Joi.validate(req.body, schema)
        .then(function () {
            var userId = req.body.userId;
            var id = req.body.id;
            var description = req.body.description;

            TodoList.updateOne({
                    userId: userId,
                    'todoList._id': id
                },
                {
                    $set: { 'todoList.$.description': description }
                })
                .then(function () {
                    res.sendStatus(200);
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
});

router.put('/completeorrestoretask', passport.authenticate('jwt', { session: false }), function (req, res) {
    var schema = {
        userId: Joi.string().required(),
        id: Joi.string().required(),
        done: Joi.boolean().required()
    };

    Joi.validate(req.body, schema)
        .then(function () {
            var userId = req.body.userId;
            var id = req.body.id;
            var done = req.body.done;

            TodoList.updateOne({
                    userId: userId,
                    'todoList._id': id
                },
                {
                    $set: { 'todoList.$.done': done }
                })
                .then(function () {
                    res.sendStatus(200);
                })
                .catch(function (err) {
                    res.status(500).send(err);
                });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
});

router.delete('/deletetask/:id/:userId', passport.authenticate('jwt', { session: false }), function (req, res) {
    var schema = {
        userId: Joi.string().required(),
        id: Joi.string().required()
    };

    Joi.validate(req.params, schema)
        .then(function () {
            var userId = req.params.userId;
            var id = req.params.id;

            TodoList.updateOne({
                    userId: userId
                },
                {
                    $pull: { todoList: { '_id': id } }
                })
                .then(function () {
                    res.sendStatus(200);
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
