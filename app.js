// book data
let book = {
    title  : 'Enigma 2',
    author  : 'sam',
    discount : 10,
    tax : 5,
    price : 100000,
    status : true,
    stock : 11,
    purchase: 3
};

// set variabel for calculating later
let amDiscount, priceDiscount, amTax ,priceTax, totalPrice, totalPricePur, actualPur = 0;

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


 // Show all data
 console.log("============================");
 console.log("Book Title: ", book.title);
 console.log("Author: ", book.author);
 console.log("Price: Rp.", book.price);
 console.log("Stock:", book.stock, "pcs");
 console.log("Discount: ", book.discount + "%");
 console.log("Amount of Discount: Rp.", amDiscount);
 console.log("Price after Disc: Rp.", priceDiscount);
 console.log("Tax: ", book.tax + "%");
 console.log("Amount of Tax: Rp.", amTax);
 console.log("Price after Tax: Rp.", priceTax);
 console.log("============================");
 console.log("Price Total: Rp.", totalPrice);
 console.log("============================");
}

 function termOfCredit(credit){
     // array untuk bulan
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    let currMonth = 9;
        
    console.log(`Rincian cicilan ${credit} bulan, dimulai dari bulan ${months[currMonth]}`);

    // harga cicilan/bulan berdasarkan harga buku terakhir
    let creditPrice = totalPricePur / credit;

    // Array kosong untuk di push
    let toc = [];

    // var kosong untuk update harga total
    let tocCr = 0;

    // implement desctructuring dan spread
    const [...a] = months;

    // looping for pushing the 
    for (let i = 0; i < credit; i++){
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
     
}
function purchaseBook(book,credit) {

    calculateToc(book);

    // Jika onsale true
    if (book.status == true){
        // looping untuk pembeian
        for(let i = 1; i <= book.purchase; i++){
            console.log("Barang dibeli",i);
            totalPricePur = totalPrice * i;
            actualPur++;
            book.stock--;

            if (book.stock < 1){
                console.log("=> Barang habis");
                stock = 0;
                break;
            }
        }
        
        console.log("============================");
        console.log("Purchase: ", credit, "pcs");
        console.log("Actual Purchase: ", actualPur, "pcs");
        console.log("Total Price: Rp.", totalPricePur);
        console.log("Stock Update:", book.stock);
        console.log("============================");

        // ketentuan cicilan toc
        termOfCredit(credit);
    // Jika onsale false
    } else {
        console.log("=> Status buku ini tidak dijual");
    };

};

// panggil functi on
//purchaseBook(book,10);
//termOfCredit(10)
module.exports = book;