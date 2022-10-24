const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({ 
    title: String,
    author: String,
    date_published: Date,
    price: Number,
    createdAt: Date,
    updateAt: Date
}, {timestamps: true});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;