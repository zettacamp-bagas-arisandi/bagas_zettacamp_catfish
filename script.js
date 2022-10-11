function purchaseBook(title, author, discount, tax, price, status, stock, purchase) {

    // Amount of Discount
    let amDiscount = discount / 100 * price; 
    
    // Price after discount
    const priceDiscount = price - amDiscount;

    // Amount of Tax
    let amTax = tax / 100 * price;

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
    console.log("Price: ", price);
    console.log("Stock:", stock);
    console.log("On Sale: ", status);
    console.log("Discount: ", discount + "%");
    console.log("Amount of Discount: ", amDiscount);
    console.log("Tax: ", tax + "%");
    console.log("Amount of Tax: ", amTax);
    console.log("Price after: ", totalPrice);
    console.log("============================");
   
    // looping untuk pembeian
    for(let i = 1; i <= purchase; i++){
        console.log("Barang dibeli",i);
        totalPricePur = totalPrice * i;
        actualPur++;
        stock--;

        if (stock == 0){
            console.log("=> Barang habis");
            break;
        }
    }
    
    if (stock > 0) {
        console.log("=> Masih bisa dibeli");
    }
    console.log("Total Purchase: ", purchase);
    console.log("Actual Purchase: ", actualPur);
    console.log("Total Price: ", totalPricePur);
    console.log("Stock Update:", stock);
   
    console.log("============================");
}

// panggil function
purchaseBook('Enigma 2', 'Sam', 10, 5, 5000, true, 10, 12);