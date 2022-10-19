const books = require('./book.js');

let setBook = new Set([books[0].title, books[1].title, books[2].title]);
let mapBook = new Map();
    mapBook.set(books[0].title, books[0]);
    mapBook.set(books[1].title, books[1]);
    mapBook.set(books[2].title, books[2]);

function myFunction(title){
        if( setBook.has(title) ){
            console.log(mapBook.get(title))
        }else{
            console.log(`${title} tidak ada`)
        }
}

myFunction('Judul Buku 2')



// app.post("/booksetmap", express.urlencoded({extended:true}) ,(req,res)=>{
//     const {title} = req.body;
//     if(!title){
//         res.send("book kosong")
//     }
//     if(setBook.has(title)){
//         res.send(`judul buku ada yang duplikat: ${title}, ${mapBook.get(title)}`);
//     }else{
//         mapBook.set(title,{...books,title})
//         setBook.add(title);
//         console.log(setBook)
//         res.send(mapBook.get(title));
//         }
//     });