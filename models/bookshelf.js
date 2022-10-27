const mongoose = require("mongoose");

const bookShelfSchema = new mongoose.Schema({ 
        name: String,
        books: [{
                _id: false,
                books_id: {
                  type : mongoose.Schema.Types.ObjectId, 
                  ref: 'book' 
                },
                added_date: {
                  type: Date
                },
                stock: {
                  type: Number
                }
        }],
        date: [{
                _id: false,
                date: {
                  type: Date,
                  default: new Date()
                },
                  time: {
                  type: String,
                  }
        }]
}, {timestamps: true});

const bookShelf = mongoose.model('bookShelf', bookShelfSchema);
module.exports = bookShelf;