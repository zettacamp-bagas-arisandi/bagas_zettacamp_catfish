// require things
const express = require("express");
const mongoose = require("mongoose");
const modelBook = require("./model.js");
const filterFind = require("./function.js");

// body parser
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true })

// server
const app = express();
const port = 4000;

// Databases
const db = 'localhost:27017';
const database = 'zettacamp';         

// function connect to db
const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${db}/${database}`)
    console.log(`Connected to ${db}`)
  } catch (err) {
    console.log('Failed to connect to MongoDB', err)
  }
}

// connect to DB
connectDB();

// start server
app.listen(port);
console.log(`Server running at port:${port}`);

app.post('/add',urlencodedParser, async (req,res) => {
    let { title, author, date_published, price} = req.body;
    const addBook = new modelBook({
        title: title,
        author: author,
        date_published: new Date(date_published),
        price: price
    });
    await addBook.save();
    res.send(addBook)
});

app.get('/find',urlencodedParser, (req,res) => {
    filterFind(req,res);
});

app.put('/update', urlencodedParser, async (req, res) => {
    let { id, title, author, date_published, price} = req.body;
    let cek = null;
    if (id == null || id == undefined){
        cek = 'Masukkan Object ID yang ingin dirubah';
    }else{
        cek = await modelBook.findByIdAndUpdate(id, {
            title: title, 
            author: author, 
            date_published: date_published, 
            price: price 
        }, {new: true});
    }
        res.send(cek);
});

app.delete('/delete', urlencodedParser, async (req,res) => {
    let { id, title, author, date_published, price} = req.body;
    let cek = null;

    if (id!=null || id!=undefined){
        cek = await modelBook.findByIdAndDelete(id);
        cek = `Dokumen ${id} dihapus`;
    }

    if (title!=null || title !=undefined){
        cek = await modelBook.deleteOne({title:title})
    }

    res.send(cek)
});





// async function generateRandomBook(){
//     let = yy = 2000;
//     let = mm = 01;
//     let = dd = 11; 

//     for(let i = 0; i < 10; i++){
//         if (mm > 12){
//             mm = 0;
//         }
//         yy++;
//         mm++;
//         dd++;
//         const addBook = new modelBook({
//             title: `Judul Buku ${i+1}`,
//             author: `Author ${i+1}`,
//             date_published: new Date([yy, mm, dd].join('-')),
//             price: i * 1000
//         });
//         await addBook.save();
         
//     }
// }

// generateRandomBook();