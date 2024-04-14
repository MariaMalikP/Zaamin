import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    task: {
        type: String,
        required: true,
    },

});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;