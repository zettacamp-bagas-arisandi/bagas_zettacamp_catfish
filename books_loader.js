// import dataloader
const DataLoader = require('dataloader');
const modelBook = require('./models/model.js');


// import model
const loadBooks = async function(books){
    let booksList = await modelBook.find({
        _id: {
            $in: books
        }
    })

    let booksMap = {};

    booksList.forEach((n) => {
        booksMap[n._id] = n
    })
    console.log(booksList)
    return books.map(id => booksMap[id])
}

const booksListLoader = new DataLoader(loadBooks);
module.exports = booksListLoader;

