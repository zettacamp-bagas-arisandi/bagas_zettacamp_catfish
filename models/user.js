const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({ 
        username: String,
        password: String,
        role: {
            type: String,
            default: 'Admin'
        },
        active: {
            type: Boolean,
            default: false
        }
}, {timestamps: true});

const modelUser = mongoose.model('users_books', userSchema);
module.exports = modelUser;