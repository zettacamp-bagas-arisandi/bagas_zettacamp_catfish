const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({ 
    title: String,
    author: String,
    date_published: {
        type: Date,
        default: new Date()
    },
    price: {
        type: Number,
        default: 0
    },
    stock: Number,
    createdAt: Date,
    updateAt: Date
}, {timestamps: true});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;