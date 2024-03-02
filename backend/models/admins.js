import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    Admin_ID: {
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
    Address: {
        type: String,
        required: true,
    },
    Age: {
        type: Number,
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
    Profile_Image: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema, 'Admin');

export default Admin;