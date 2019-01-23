import mongoose from 'mongoose';
import TodoSchema from './Todo';
const Schema = mongoose.Schema;

const  TodoListSchema = new Schema({
    userId: String,
    todoList: [TodoSchema]
});

const TodoList = mongoose.model('TodoList', TodoListSchema);

export default TodoList;
