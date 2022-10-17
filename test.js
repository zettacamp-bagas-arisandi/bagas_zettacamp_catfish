function x(){
    let book ={
        nama: "asdwa",
        price: 2211 
    }
return book;
}

async function tampilx(){
    const xVar = await x();
   // console.log(xVar);
}

const tampil = tampilx()
console.log(tampil)
