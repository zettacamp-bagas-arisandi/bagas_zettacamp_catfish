const fs = require('fs');

let book = {
    title  : 'Enigma 2',
    author  : 'sam',
    discount : 10,
    tax : 5,
    price : 100000,
    status : true,
    stock : 11,
    purchase: 3,
    credit : 10,
};


function purchaseBook(book) {

    // Amount of Discount
    const amDiscount = book.discount / 100 * book.price; 
    
    // Price after discount
    const priceDiscount = book.price - amDiscount;

    // Amount of Tax
    const amTax = book.tax / 100 * book.price;

    // Price after tax
    const priceTax = book.price + amTax;
    
    // Total price after tax and discount
    const totalPrice = book.price + amTax - amDiscount;

    // Total price amount of purchases 
    let totalPricePur = 0;
   
    // Actual purchase
    let actualPur = 0;

    // Show all data
    console.log("============================");
    console.log("Book Title: ", book.title);
    console.log("Author: ", book.author);
    console.log("Price: Rp.", book.price.toLocaleString('ID'));
    console.log("Stock:", book.stock, "pcs");
    console.log("Discount: ", book.discount + "%");
    console.log("Amount of Discount: Rp.", amDiscount.toLocaleString('ID'));
    console.log("Price after Disc: Rp.", priceDiscount.toLocaleString('ID'));
    console.log("Tax: ", book.tax + "%");
    console.log("Amount of Tax: Rp.", amTax.toLocaleString('ID'));
    console.log("Price after Tax: Rp.", priceTax.toLocaleString('ID'));
    console.log("============================");
    console.log("Price Total: Rp.", totalPrice.toLocaleString('ID'));
    console.log("============================");

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
        console.log("Purchase: ", book.credit, "pcs");
        console.log("Actual Purchase: ", actualPur, "pcs");
        console.log("Total Price: Rp.", totalPricePur.toLocaleString('ID'));
        console.log("Stock Update:", book.stock);
        console.log("============================");

        // ketentuan cicilan toc

            // array untuk bulan
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
            let currMonth = 9;
        
            console.log(`Rincian cicilan ${book.credit} bulan, dimulai dari bulan ${months[currMonth]}`);

            // harga cicilan/bulan berdasarkan harga buku terakhir
            let creditPrice = totalPricePur / book.credit;

            // Array kosong untuk di push
            let toc = [];

            // var kosong untuk update harga total
            let tocCr = 0;

            // implement desctructuring dan spread
            const [...a] = months;

            // looping for pushing the 
            for (let i = 0; i < book.credit; i++){
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

                //
                currMonth++;
            };

            console.log([...toc]);
     
    // Jika onsale false
    } else {
        console.log("=> Status buku ini tidak dijual");
    };

};

// panggil function
purchaseBook(book);
