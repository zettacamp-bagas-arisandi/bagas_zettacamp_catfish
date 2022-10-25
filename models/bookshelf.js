const mongoose = require("mongoose");

const bookShelfSchema = new mongoose.Schema({ 
        name: String,
        book_id: [{ type : mongoose.Schema.Types.ObjectId, ref: 'book' }]
}, {timestamps: true});

const bookShelf = mongoose.model('bookShelf', bookShelfSchema);
module.exports = bookShelf;