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
    console.log(`Connected to ${database}`)
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
    let {id,name} = req.body;
    let cek = null;
    if (id){
        cek = await modelBookShelf.findById(id);
        if (!cek){
            cek = `${id} tidak ada`;
        }
    }else if (name){
        cek = await modelBookShelf.find({name: name});
        if (cek==''){
            cek = `${name} tidak ada`;
        }
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


app.get('/bookshelf-find', urlencodedParser, async (req,res)=>{
    let {id} = req.body;
    let cek = null;
    if (id){
        cek = await modelBookShelf.find({ books: { $elemMatch: { books_id: {$eq:  mongoose.Types.ObjectId(id) }} } })
        if (cek == ''){
            cek = `${id} tidak ada`;
        }
    }else{
        cek = 'Masukkan ID yang ingin dicari';
    }
    res.send(cek);
})

app.post('/bookshelf-add', urlencodedParser, async (req,res) => {
    let {name,book_ids,date_add,stocks} = req.body;
    let idArr = [];
    let dateArr = [];
    let stockArr = [];

    idArr = book_ids.split(' ');
    dateArr = date_add.split(' ');
    stockArr = stocks.split(' ');
    
    const newBookShelf = new modelBookShelf({
        name: name,
        books: [],
        date: [{
            date: date_add,
            time: `${new Date().getHours()}:${new Date().getMinutes()}`
        }]
    });
    

    for(const [i,n] of idArr.entries()){
        let newDate = new Date(dateArr[i])
        console.log(newDate)
        newBookShelf.books.push({
            books_id: n,
            added_date: newDate,
            stock: stockArr[i]
        })
    }
    console.log(newBookShelf)
    const cek = await newBookShelf.save()
    console.log(cek)
    res.send(cek);
});

app.put('/bookshelf-booksdate', urlencodedParser, async(req,res) => {
    let {id, date, new_date} = req.body;
    let cek = null;
    if (id){
        cek = await modelBookShelf.updateOne({ "_id": mongoose.Types.ObjectId(id)
        },{
            $set: {
            "books.$[idx].added_date": new Date(new_date)  
            }
        },{
            arrayFilters:[{
                "idx.added_date": {
                    $lte: new Date(date)}
            }]
        });
    }else{
        cek = `${id} tidak ada`;
    }
    res.send(cek);
})

app.put('/bookshelf-date', urlencodedParser, async (req,res) =>{
    let {id, date,new_date} = req.body;
    let cek = null;
    if (id){
        cek = await modelBookShelf.updateOne({ "_id": mongoose.Types.ObjectId(id)
        },{
            $set: {
            "date.$[idx].date": new Date(new_date)  
            }
        },{
            arrayFilters:[{
                "idx.date": {
                    $lte: new Date(date)}
            }]
        });
    }else{
        cek = `${id} tidak ada`;
    }
    res.send(cek);
})

app.put('/bookshelf', urlencodedParser, async (req,res) => {
    let {id, name, book_ids, date, stocks} = req.body;
    let cek = null;
    if (id){

        if (name){
        cek = await modelBookShelf.findByIdAndUpdate(id,{
            name: name,
        },{new: true});
        }else if(book_ids){
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



app.get('/books/find', urlencodedParser, async(req, res) =>{
    let {id,price = 500, title} = req.body;
    price = parseInt(price);
    let cek = await modelBook.aggregate([
        {
            $match: {_id : mongoose.Types.ObjectId(id)}
        },
        {
            $addFields: { 
                price_after_add: {$sum: ["$price", price] },
            } 
        },
        {
            $project: {
                _id: 0
               }
        }
    ])
    console.log(cek)
    if (!cek.length){
        cek = await modelBook.aggregate([
            {
                $sort: { _id: -1}
            },
            {
                $addFields: {
                    price_after_add: {$sum: ["$price", price] },
                    description: {
                        $concat: ["$title", " - ", "$author", " - (", {$toString: "$stock"}, ")"]
                        },
                    price: {
                        $concat: [ {$toString: "$price"}, " => ", {$toString: {$sum: ["$price", price]}}]
                    }
                }
            },
            {
                $project: {_id: 1, description: 1, price: 1, date_published: 1}
            }
        ])
    }
    res.send(cek);
});

app.get('/books/author-find', urlencodedParser, async(req, res) =>{
    let query = {$and: []};
    let {price = 500, author} = req.body;
    price = parseInt(price);

    // kondisi
    if(author){
        query.$and.push({
            author: author

        })
    }
    
    if(price){
        query.$and.push({
            price:price
        })
    }
    
    
    let cek = await modelBook.aggregate([
        {
            $match: query
        },
        { 
            $group:
            {
              _id: "$author",
              list: { $push:  { title: "$title", date_published: "$date_published", price: "$price"} },
              total : {$sum : 1}
            }
        }

    ]);
    if (!cek.length){
        cek = `${author} tidak ada`
    }
    res.send(cek);
});

app.get('/bookshelves', urlencodedParser, async(req, res) => {
    let {id, author} = req.body;
    let cek;
    if (!id){
        cek = await modelBookShelf.find({});
    }else{
        cek = await modelBookShelf.aggregate([
            {
                $match: {_id : mongoose.Types.ObjectId(id)}
            },
            {
                $lookup:{
                    from: "books",
                    localField: "books.books_id",
                    foreignField: "_id",
                    as: "books_populate"
                }},
            // {
            //     $match: {"books_populate.author": author }
            // }
        ])
    
       
        if (author){
            cek = await modelBookShelf.aggregate([
            {
                    $match: {_id : mongoose.Types.ObjectId(id)}
            },
            {
                $lookup:{
                    from: "books",
                    localField: "books.books_id",
                    foreignField: "_id",
                    as: "books_populate"
                }},
               
                {
                $project: {
                        books: 0, createdAt: 0, updatedAt: 0, date: 0, __v: 0
                }
            }
                ]);

        }

        if (!cek.length){
            cek = {
                status: 404,
                message: `${author} tidak ditemukan`
            }
        };
    }
    res.send(cek);   
});


app.post('/books-priceadd', urlencodedParser, async(req,res) =>{
    let {id,price} = req.body;
    price = parseInt(price);
    let cek = await modelBook.aggregate([
        {
            $match: {_id : mongoose.Types.ObjectId(id)}
        },
        {
            $addFields: { 
                price_after_add: {$sum: ["$price", price] }
            } 
        }
    ])
    if (cek==''){
        cek = await modelBook.aggregate([
            {
                $sort: { _id: -1}
            },
            {
                $addFields: {
                    price_after_add: {$sum: ["$price", price] }
                }
            },
            {
                $project: {createdAt: 0, updatedAt: 0, __v: 0, date_published: 0, price: 0}
            }
        ])
    }
    res.send(cek);
});

app.get('/bookshelf-unwind', urlencodedParser, async(req,res) => {
    let cek = await modelBookShelf.aggregate([
        {
            $unwind: "$books"
        },{
            $project: { name: 1, books: 1}
        }
    ])
    res.send(cek);
});

///////////////////////// Today Task //////////////////////////////////////////////////
app.get('/books-page', urlencodedParser, async(req,res) => {
    let {page, limit = 2} = req.body;
    let skip = 0;
    
    // conver ke int
    page = parseInt(page);
    limit = parseInt(limit);
   
    // kondisikan limit
    if (limit < 1){
        limit = 1;
    }
    
    // status pages
    let pages = `${page} / ${Math.ceil(await modelBook.count()/limit)}`;

    // page 
    if (page > 1 ){
        skip = (page-1) * limit
    }else{
        page = 1;
    }


    // data sebagai respon
    let data = await modelBook.aggregate([
        {
            $skip: skip
        },{
            $limit: limit
        }
    ]);
  
    // tambah keterangan page
    if (data.length){
        data = {
            page: pages, 
            data
        }
    }else{
        data = `Page ke-${page} tidak ada`
    }
    res.send(data);
})

app.get('/books-facet', urlencodedParser, async(req,res) => {
    let data = await modelBook.aggregate([
        {
            $facet: {
                "categorizedByPrice": [
                    {
                        $group:{
                            _id : "$price",
                            count: { $sum: 1 },
                            list: { $push: { title: "$title", author: "$author"} }
                           
                        }
                    }
                ]
            }
        }
    ])
    res.send(data)
})

/////////////////////////////////////////////////////////////////////////////////////////

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

// async function save(){

// let id = [];
// let yy = [2000, 2002, 2004, 2005, 2010, 2007, 2008, 2012, 2018];
// let mm = [01,02,03,04,05,06,07,08,09,10,11,12];
// let dd = 1; 
// let stocks = [1,2,3,4,5] 

// for ( let i = 1; i <= 20; i++){
//     let data = await modelBook.findOne({title: `Judul Buku ${i}`});
//     id.push(data._id.toString())
//     }

//     for( let i = 1; i <= 7; i ++){

//         let getyy = Math.floor(Math.random() * yy.length);
//         let getmm = Math.floor(Math.random() * mm.length);
//         dd++;

//         let getStock = Math.floor(Math.random() * stocks.length);

//         let getId1 = Math.floor(Math.random() * id.length);
//         let getId2 = Math.floor(Math.random() * id.length);
//         let getId3 = Math.floor(Math.random() * id.length);
//         const newBookShelf = new modelBookShelf({
//             name: `Bookshelf ${i}`,
//             books: [{
//                 books_id: id[getId1],
//                 added_date: new Date([yy[getyy], mm[getyy], dd].join('-')) ,
//                 stock: stocks[getStock],
//             },
//             {
//                 books_id: id[getId2],
//                 added_date: new Date([yy[getyy], mm[getyy], dd].join('-')) ,
//                 stock: stocks[Math.floor(Math.random() * stocks.length)]
//             },
//             {
//                 books_id: id[getId3],
//                 added_date: new Date([yy[getyy], mm[getyy], dd].join('-')) ,
//                 stock: stocks[Math.floor(Math.random() * stocks.length)]
//             }],
//             date: [{
//                 date: new Date([yy[getyy], mm[getyy], dd].join('-')),
//                 time: `${new Date().getHours()}:${new Date().getMinutes()}`
//             }]
//         })
//         const cek = await newBookShelf.save()
//         console.log(cek)
//     }

// }
// save()