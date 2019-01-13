var express = require('express');
var router = express.Router();

router.get('/todolist/:userid', function (req, res, next) {
    // get user's todo list with userid param
    // send todo list or error message
    res.json({
        todoList: [
            {
                id: 1,
                description: "this comes from the express app boii!",
                done: false
            },
        ]
    });
});

router.put('/addtask/:task/:userid', function () {
    // get user's todo list with userid param
    // add todo list item with task param
    // return success or error message.
});

router.put('/edittodo/:id/:userid/:description', function (req, res, next) {
    // get user's todo list with userid param
    // edit todo list item with id param and description param
    // return success or error message.
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
