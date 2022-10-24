const express = require("express");
const books = require('./book.js');
const fs = require('fs');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true })

const app = express();
const port = 4000;

let bookCredit = [];

const userSet = 'bagas';
const passSet = 'admin123';

// set variabel for calculating later
let amDiscount, priceDiscount, amTax ,priceTax, totalPrice, totalPricePur, actualPur = 0;

let setBook = new Set();
let mapBook = new Map();

// setBook.add(books[0].title);
// setBook.add(books[1].title);
// setBook.add(books[2].title);

// mapBook.set(books[0].title, books[0]);
// mapBook.set(books[1].title, books[1]);
// mapBook.set(books[2].title, books[2]);

/////////////// SET MAP /////////////////

for (let i = 0; i < books.length; i++){
    setBook.add(books[i].title);
    mapBook.set(books[i].title, books[i])
}

// for (let [idx, val] of books.entries()){
//     setBook.add([books[idx].title])
//     mapBook.set(books[idx].title, books[idx]);
// }

// event
const events = require('events');
const eventEmitter = new events.EventEmitter();
//Assign the event handler to an event:
eventEmitter.on('rf', readFileTxt);

// deklarasi promise
const promise = true;
const myPromise = new Promise((resolve, reject) =>{
    if (promise === true){
        resolve('Resolved!');
    } else {
        reject('Not Resolved!');
    }
});

// event handler
async function readFileTxt(){
    fs.readFile('data.txt', 'utf8', function(err, data){
        console.log(data);
    });
    console.log(`File terbaca`);
}

// middleware
app.use(authentication);

// route
app.get('/', (req,res) => {
    res.send(`Welcome admin ${userSet}!`);
});

app.post('/buy', urlencodedParser, async(req, res) => {
    let {title, amount} = req.body;

    if (amount === undefined){
        amount = 1;
    }

        if(setBook.has(title) ){
            // console.log( purchaseBook(mapBook.get(title),10))
            const get = await purchaseBook(mapBook.get(title), amount);
            res.send({judul: title, cicil: `${amount} bulan`, total: `Rp. ${get.totalPricePur.toLocaleString('ID')}`, detail: get.toc})
        }else{
            res.send(`${title} tidak ada`);
        }

});

app.get('/book', (req,res) => {
    res.send([...mapBook]);
 });

app.get('/async', async(req,res) => {
    await purchaseBook(1, 7);
    res.send(bookCredit);
});

app.get('/noawait', (req, res) =>{
    myPromise
    .then((data) => {
        console.log(data);
        event('rf');
        res.send('Without Await');
    })
    .catch((err) => {
        console.log(err);
        res.end();
    });
});

app.get('/await', async(req, res) =>{
    try{
        await event('rf');
        res.send('With Await');
    }catch(err){
        console.log(err);
        res.end();
    }
});

///////////////////////// ROUTE TASK HARI INI///////////////////////////
app.post("/checkbook", urlencodedParser, (req,res) =>{
    const title =  req.body.title;
    if( setBook.has( title) ){
        res.send( mapBook.get(title));
    }else{
        res.send(`${title} tidak ada`);
    }
});

app.post("/addbook", express.urlencoded({extended:true}), (req,res) =>{
    const {title} = req.body;
    if(setBook.has(title) ){
        res.send(`${title} sudah ada, tidak bisa ditambahkan`);
    }else{
        setBook.add(title);
        mapBook.set(title,{...books[0],title});
        // console.log(`${title} ditambahkan`);
        res.send(mapBook.get(title));
    }
});
//////////////////////////////////////////////////////////////////////////
app.use('*', (req,res) => {
    res.send("Path tidak ditemukan..");
});


app.listen(port);
console.log(`Server running at port:${port}`);

// fire the event
async function event(name){
    // fire
    eventEmitter.emit(name);
}

// function purchases book
async function termOfCredit(credit, addPrice = 100){

    // array untuk bulan
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    let currMonth = 9;
        
    console.log(`Rincian cicilan ${credit} bulan, dimulai dari bulan ${months[currMonth]} sampai ${totalPricePur}`);

    // harga cicilan/bulan berdasarkan harga buku terakhir
    let creditPrice = totalPricePur / credit;

    // var kosong untuk update harga total
    let tocCr = 0;
    let toc = [];

    // implement desctructuring dan spread
    const [...a] = months;

    // looping for pushing the 
    for (let i = 0; i < credit; i++){
        
        if(i === 5 ){
            creditPrice += addPrice ;
        }
        
        tocCr += creditPrice;

        // control month berdasarkan bulan sekarang
        if (currMonth > 11){
            currMonth = 0;
            }

            // array func, untuk push ke array object
            toc.push( {
            bulan: a[currMonth],
            cicilan: Math.round(creditPrice).toLocaleString('ID'),
            total: Math.round(tocCr).toLocaleString('ID')
            } );

                
        currMonth++;
            };

            // console.log(toc);
            return {toc, totalPricePur};
    }

function calculateToc(book){
    // calculate of certain price
    
    //discount
    amDiscount = book.discount / 100 * book.price;
    priceDiscount = book.price - amDiscount;
    // tax
    amTax = book.tax / 100 * book.price;
    priceTax = book.price + amTax;
    // Total price after tax and discount
    totalPrice = book.price + amTax - amDiscount;
    }

async function purchaseBook(indexBook,credit) {
    //const book = books[indexBook];
    const book = indexBook;
    // Jika onsale true
    if (book.status == true){
        calculateToc(book);

        // looping untuk pembeian
        for(let i = 1; i <= book.purchase; i++){
            // console.log("Barang dibeli",i);
            totalPricePur = totalPrice * i;
            actualPur++;
            book.stock--;

            if (book.stock < 1){
                // console.log("=> Barang habis");
                stock = 0;
                break;
            }
        };

        bookCredit = await termOfCredit(credit);
        console.log(bookCredit);
        return bookCredit;

        // Jika onsale false
        } else {
            console.log("=> Status buku ini tidak dijual");
        };
    };

// function authentication    
function authentication(req, res, next){
    let authheader = req.headers.authorization;
    //console.log(req.headers.authorization);

    if (!authheader){
        res.send("Tidak ada otentikasi..");
        res.end();
    } else {
        let auth = new Buffer.from(authheader.split(' ')[1],'base64').toString().split(':');
        let user = auth[0];
        let pass = auth[1];
        //console.log(auth)
        if (user == userSet && pass == passSet) {
    
            // If Authorized user
            // console.log(`${userSet} berhasil terotentikasi..`);
            next();
        } else {
            res.send("Kamu tidak terotentikasi..");
            res.end();
        }
    }
}