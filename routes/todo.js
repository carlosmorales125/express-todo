var express = require('express');
var Joi = require('joi');
var router = express.Router();
var User = require('../models/User');
var TodoList = require('../models/TodoList');

var todoList = [
    {
        id: 0,
        description: "this comes from the express app boii!",
        done: false
    },
    {
        id: 1,
        description: "this comes from the express app boii again and again!",
        done: false
    },
    {
        id: 2,
        description: "testing nodemon, one more time",
        done: false
    }
];

function validateTask (task) {
    var schema = {
        description: Joi.string().required(),
    };
    return Joi.validate(task, schema);
}

router.get('/todolist/:userid', function (req, res) {
    // get user's todo list with userid param
    // send todo list or error message
    res.json({
        todoList: todoList
    });
});

router.put('/addtask/:userid', function (req, res) {
    // get user's todo list with userid param
    // add todo list item with task and userid param and description param
    // return success or error message.
    var task = req.body;
    var validatedTask = validateTask(task);
    if (validatedTask.value) {
        var newTask = {
            id: todoList.length + 1,
            description: task.description,
            done: false
        };
        todoList.push(newTask);
        res.json(newTask);
    } else {
        //error message
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
