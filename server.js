// require things
const express = require("express");
const mongoose = require("mongoose");
const modelBook = require("./models/model.js");
const modelBookShelf = require('./models/bookshelf.js');
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
    try{
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
    }catch(err){
        cek = err;
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

app.get('/bookshelf', urlencodedParser, async (req,res) => {
    let {id} = req.body;
    let cek = null;
    if (id != null){
        cek = await modelBookShelf.findById(id);
    }else{
        cek = await modelBookShelf.find({});
    }
    res.send(cek);
});

app.get('/bookshelfby', urlencodedParser, async (req,res) => {
    let {id} = req.body;
    let ids = [];
    let cek = null;
    if (id!=null){
        ids = id.split(' ');
        cek = await modelBookShelf.find({book_id: {$all:ids}});
    }else{
        cek = 'Masukkan ID yang ingin dicari';
    }
    res.send(cek);
});

// app.get('/bookshelfbys', urlencodedParser, async (req,res) => {
//     let {condition} = req.body;
//     let cek = await modelBookShelf.find({name: {$gt: /condition/ }})
//     res.send(cek);
// })

app.post('/bookshelf', urlencodedParser, async (req,res) => {
    let {name,book_ids} = req.body;
    const newBookShelf = new modelBookShelf({
        name: name,
        book_id: book_ids.split(' ')
    })
    const cek = await newBookShelf.save()
    console.log(cek)
    res.send(cek);
});

app.put('/bookshelf', urlencodedParser, async (req,res) => {
    let {id, name, book_ids} = req.body;
    let cek = null;
    if (id!= null){
        if (name!=null){
        cek = await modelBookShelf.findByIdAndUpdate(id,{
            name: name,
        },{new: true});
        }else if(book_ids!=null){
            let book_idArr = book_ids.split(' ');
            let newArr = [];
            if (book_idArr.length > 1){
                for( const n of book_idArr){
                    if(n !== '' && n !== ' ' && n){
                        newArr.push(n)
                    }
                }
            }
            console.log(newArr)
            cek = await modelBookShelf.findByIdAndUpdate(id,{
                name: name,
                book_id: newArr
            },{new: true});
        }else{
            cek = 'book_ids harus diisi jika ingin dirubah';
        }
    }else{
        cek ='Masukkan Id yang ingin diupdate'
    }
    console.log(cek)
    res.send(cek);
});

app.delete('/bookshelf', urlencodedParser, async (req,res) => {
    let {id} = req.body;
    let cek = null;
        if (id != null){
        cek = await modelBookShelf.findByIdAndDelete(id);
        
    }else{
        cek = `Masukkan ID yang ingin dihapus`
    }
    console.log(cek, 'Dihapus')
    res.send(`Bookshelf dengan id:${id} dihapus`);
});






// async function generateRandomBook(){
//     let price = [10000, 20000, 15000, 25000, 30000, 35000, 40000, 50000];
//     let yy = [2000, 2002, 2004, 2005, 2010, 2007, 2008, 2012, 2018];
//     let mm = [01,02,03,04,05,06,07,08,09,10,11,12];
//     let dd = 1; 

//     for(let i = 0; i < 20; i++){
//         let getPrice = Math.floor(Math.random() * price.length);
//         let getyy = Math.floor(Math.random() * yy.length);
//         let getmm = Math.floor(Math.random() * mm.length);
//         dd++;
//         const addBook = new modelBook({
//             title: `Judul Buku ${i+1}`,
//             author: `Author ${i+1}`,
//             date_published: new Date([yy[getyy], mm[getyy], dd].join('-')),
//             price: price[getPrice]
//         });
//         await addBook.save();
         
//     }
// }

// generateRandomBook();

async function save(){

let id = [];

for ( let i = 1; i <= 20; i++){
    let data = await modelBook.findOne({title: `Judul Buku ${i}`});
    id.push(data._id.toString())
    }


    for( let i = 1; i <= 7; i ++){
        let getId1 = Math.floor(Math.random() * id.length);
        let getId2 = Math.floor(Math.random() * id.length);
        let getId3 = Math.floor(Math.random() * id.length);
        const newBookShelf = new modelBookShelf({
            name: `Bookshelf ${i}`,
            book_id: [id[getId1],id[getId2],id[getId3]]
        })
        const cek = await newBookShelf.save()
        console.log(cek)
    }

}
//save()



//getBookShelf()

// let booksTemp = [];

// async function getBooks(){
//     const books = await modelBook.find({})
//     const tmp = [];

//     function getRndInteger(min, max) {
//         return Math.floor(Math.random() * (max - min) ) + min;
//         }
//     //console.log(books)
// }
// getBooks()