const express = require("express");
const book = require('./app.js')

const app = express();
const port = 4000;

let bookCredit = [];

const userSet = 'bagas';
const passSet = 'admin123';

// set variabel for calculating later
let amDiscount, priceDiscount, amTax ,priceTax, totalPrice, totalPricePur, actualPur = 0;

// middleware
app.use(authentication);


app.get('/', (req,res) => {
    res.send(`Welcome admin ${userSet}!`);
});

app.get('/book', (req,res) => {
    res.send(book);
 });

app.get('/async', async(req,res) => {
    const getPurchaseBook = await purchaseBook(book, 7);
    res.send(bookCredit);
    //res.send(toc);
});

app.get('*', (req,res) => {
    res.send("Path tidak ditemukan..");
 });


app.listen(port);
console.log(`Server running at port:${port}`);


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
                cicilan: Math.round(creditPrice),
                total: Math.round(tocCr)
                } );
    
                    
            currMonth++;
                };
    
                console.log(toc);
                return toc;
    }

    async function purchaseBook(book,credit) {
        calculateToc(book);
    
        // Jika onsale true
        if (book.status == true){
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
        // console.log(bookCredit);


        // Jika onsale false
        } else {
            console.log("=> Status buku ini tidak dijual");
        };
    };

    
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
                console.log(`${userSet} berhasil terotentikasi..`);
                next();
            } else {
                res.send("Kamu tidak terotentikasi..");
                res.end();
            }
        }
    }