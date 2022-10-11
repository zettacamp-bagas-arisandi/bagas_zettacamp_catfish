function purchaseBook(titleBook, authorBook, discountBook, taxBook, priceBook, statusBook) {
    
    // Detail of book
    const title = titleBook;
    const author = authorBook;
    let price = priceBook;
    let status = statusBook;

    // Discount
    const discount = discountBook;
    let amDiscount = discount / 100 * price; 
    
    // Price after discount
    const priceDiscount = price - amDiscount;

    // Tax
    const tax = taxBook;
    let amTax = tax / 100 * price;

    // Price after tax
    const priceTax = price + amTax;
    
    // Total price after tax and discount
    const totalPrice = price + amTax - amDiscount;


    // Show all data
    console.log("============================");
    console.log("Book Title: ", title);
    console.log("Author: ", author);
    console.log("Price: ", price);
    console.log("On Sale: ", status);
    console.log("Discount: ", discount + "%");
    console.log("Amount of Discount: ", amDiscount);
    console.log("Tax: ", tax + "%");
    console.log("Amount of Tax: ", amTax);
    console.log("Total Price: ", totalPrice);
    console.log("============================");
}

purchaseBook('Enigma 2', 'Sam', 10, 5, 5000, true);