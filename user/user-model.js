const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({ 
    email: {
        type: String,
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Masukkan email dengan benar'],
        minLength: 5 
    },
    password: {
        type: String,
        minLength: 5
    },
    first_name: {
        type: String,
        trim: true,
        minLength: 2
    },
    last_name: {
        type: String,
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
    }],
    image: {
        type: String,
        default: "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Clipart.png"
    },
    balance: {
        type: Number,
        min: 0
    },
    question_answer: {
        type: String
    }
}, {timestamps: true});

const modelUser = mongoose.model('users', userSchema);
module.exports = modelUser;