import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
    Manager_ID: {
        type: String,
        required: true,
    },
    First_Name: {
        type: String,
        required: true,
    },
    Last_Name: {
        type: String,
        required: true,
    },
    Department: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Phone_Number: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;