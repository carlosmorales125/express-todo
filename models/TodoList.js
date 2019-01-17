var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoListSchema = new Schema({
    userId: Number,
    todoList: []
});

module.exports = mongoose.model('TodoList', TodoListSchema);
