var express = require('express');
var Joi = require('joi');
var router = express.Router();
var TodoList = require('../models/TodoList');

router.get('/todolist/:userId', function (req, res) {
    var schema = {
        userId: Joi.string().min(3).required()
    };

    var validateUserId = Joi.validate({userId: req.params.userId}, schema);

    if (validateUserId.value) {
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
    } else {
        res.status(400).send('The userId is required for this api call.');
    }
});

router.put('/addtask', function (req, res) {
    var schema = {
        userId: Joi.string().required(),
        description: Joi.string().min(3).required()
    };

    var validatedTask = Joi.validate(req.body, schema);

    if (validatedTask.value) {
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
    } else {
        res.status(400).send(validatedTask.error);
    }
});

router.put('/edittodo', function (req, res, next) {
    // get user's todo list with userid param
    // edit todo list item with id param and description param
    // return success or error message.
    var id = req.body.id;
    var description = req.body.description;

    todoList.forEach(item => {
        if (item.id === id) {
            item.description = description;
        }
    });
});

router.put('/completeorrestoretask/:id/:userid', function (req, res, next) {
    // get user's todo list with userid param
    // edit todo list item with id param
    // return success or error message.
});

router.delete('/deletetask/:id/:userid', function (req, res, next) {
    // get user's todo list with userid param
    // delete todo list item with id param
    // return success or error message.
});

module.exports = router;
