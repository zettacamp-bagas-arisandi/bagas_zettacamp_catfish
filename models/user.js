const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({ 
        username: String,
        password: String,
        role: String,
        active: Boolean
}, {timestamps: true});

const modelUser = mongoose.model('users_books', userSchema);
module.exports = modelUser;