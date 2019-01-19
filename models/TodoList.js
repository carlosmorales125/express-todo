var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TodoSchema = require('./Todo');

var TodoListSchema = new Schema({
    userId: String,
    todoList: [TodoSchema]
});

module.exports = mongoose.model('TodoList', TodoListSchema);
