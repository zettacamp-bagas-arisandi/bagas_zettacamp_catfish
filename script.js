function purchaseBook(title, author, discount, tax, price, status, stock, purchase) {

    // Amount of Discount
    const amDiscount = discount / 100 * price; 
    
    // Price after discount
    const priceDiscount = price - amDiscount;

    // Amount of Tax
    const amTax = tax / 100 * price;

    // Price after tax
    const priceTax = price + amTax;
    
    // Total price after tax and discount
    const totalPrice = price + amTax - amDiscount;

    // Total price amount of purchases 
    let totalPricePur = 0;
   
    // Actual purchase
    let actualPur = 0;

    // Show all data
    console.log("============================");
    console.log("Book Title: ", title);
    console.log("Author: ", author);
    console.log("Price: Rp.", price.toLocaleString("id-ID"));
    console.log("Stock:", stock, "pcs");
    console.log("Discount: ", discount + "%");
    console.log("Amount of Discount: Rp.", amDiscount.toLocaleString("id"));
    console.log("Price after Disc: Rp.", priceDiscount.toLocaleString("id"));
    console.log("Tax: ", tax + "%");
    console.log("Amount of Tax: Rp.", amTax.toLocaleString("id"));
    console.log("Price after Tax: Rp.", priceTax.toLocaleString("id"));
    console.log("============================");
    console.log("Price Total: Rp.", totalPrice.toLocaleString("id"));
    console.log("============================");

    // Jika onsale true
    if (status == true){
        // looping untuk pembeian
        for(let i = 1; i <= purchase; i++){
            console.log("Barang dibeli",i);
            totalPricePur = totalPrice * i;
            actualPur++;
            stock--;

            if (stock < 1){
                console.log("=> Barang habis");
                stock = 0;
                break;
            }
            
        }
        
        stock > 0 ? "=> Masih bisa dibeli" : "=> Belum tersedia lagi";
    
        console.log("============================");
        console.log("Purchase: ", purchase, "pcs");
        console.log("Actual Purchase: ", actualPur, "pcs");
        console.log("Total Price: Rp.", totalPricePur.toLocaleString("ID"));
        console.log("Stock Update:", stock);
    
        console.log("============================");
     
    // Jika onsale false
    } else {
            console.log("=> Status buku ini tidak dijual");
        }     
}

// panggil function
purchaseBook('Enigma 2', 'Sam', 10, 5, 5000, true, 5, 11);