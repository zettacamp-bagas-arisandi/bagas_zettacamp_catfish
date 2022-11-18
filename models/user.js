const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({ 
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Masukkan email dengan benar'],
        minLength: 5 
    },
    password: {
        type: String,
        required: true,
        minLength: 5
    },
    first_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2
    },
    status: {
        type : String,
        enum: ['active', 'deleted'],
        default: 'active'
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }, 
    user_type: [{
        name: String,
        view: Boolean
    }]
}, {timestamps: true});

const modelUser = mongoose.model('users', userSchema);
module.exports = modelUser;