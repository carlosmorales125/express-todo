import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    description: String,
    done: Boolean
});

export default TodoSchema;
