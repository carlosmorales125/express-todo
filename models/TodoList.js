var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoListSchema = new Schema({
    userId: String,
    todoList: []
});

module.exports = mongoose.model('TodoList', TodoListSchema);
