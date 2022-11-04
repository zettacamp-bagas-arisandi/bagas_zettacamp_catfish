const modelBook = require("./models/model.js");
const mongoose = require("mongoose");

////Query////
async function getAllBooks(parent, {page, skip = 0, limit = 0}){
  let count  = await modelBook.count();
  let result = await modelBook.aggregate([
    {
      $project: {
        id: 1, title: 1, author: 1, date_published: 1, price: 1
      }
    },{
      $skip: (page-1)*limit
    },{
      $limit: limit
    }

  ]);


  result = result.map((element) => {
        element.id = mongoose.Types.ObjectId(element._id)
        return element
      })

  return {
    count: count,
    page: page,
    max_page:  Math.ceil( count / limit),
    data_books: result
  };
}

async function getBooksBy(parent, {title, author, id}){
  let query = {$and:[]};
  let queryAgg = [];
  if (id){
    query.$and.push(
      {
        _id: mongoose.Types.ObjectId(id)
      }
    )
  }

  if (author){
    query.$and.push({
      author: author
    })
  }

  if (title){
    query.$and.push({
      title: title
    })
  }

  if (query.$and.length > 0){
    queryAgg.unshift([
      {
        $match: query
      }
    ])
  }
  

  let result = await modelBook.aggregate(queryAgg);

  result = result.map((n) => {
    n.id = mongoose.Types.ObjectId(id);
    return n
  })

  result = {
    count: result.length,
    data_books: result
  }

  return result;
  
}

async function buyBooks(parent, {id, title, tax, discount}){
  let query = {$or: []};

  if (id){
    query.$or.push(
      {
        _id: mongoose.Types.ObjectId(id)
      }
    )
  }

  if(title){
    query.$or.push(
      {
        title:title
      }
    )
  }
  

  let getData = await modelBook.aggregate([
    {
      $match: query
    }
  ]);
  
  getData = getData.map((n) => {
     n.id = mongoose.Types.ObjectId(id);
     return n;
  });

  let getTax = getData[0].price * (tax / 100);
  let getDiscount = getData[0].price * ( discount / 100);

  // let priceTax = getData[0].price + getTax;
  // let priceDiscount = getData[0].price - getDiscount;
  let priceTotal = getData[0].price + getTax - getDiscount

  console.log(priceTotal)
  result = {
    detail: getData[0],
    tax: tax,
    discount: discount,
    price_tax: getTax,
    price_discount: getDiscount,
    price_total: priceTotal
    
  }
  console.log(result)
  return result

}

////Mutation////
async function addBooks(parent, {title, author, price, date_published}){

  let duplicateCheck = await modelBook.find({});
  let data_books;
  let status;
 
  duplicateCheck.forEach( (n) => {
    if (n.title !== title || n.author !== author){
          data_books = new modelBook ({
          title: title,
          author: author,
          price: price,
          date_published: date_published
        })
        status = `Data berhasil ditambahkan`;
      }else{
        status = `${author} dengan title ${title} sudah ada`,
        data_books = null
      }
    }
    )
    
  // add.save();
  return {status, data_books};
};

async function deleteBooks(parent,{id}){
  let result = await modelBook.findByIdAndDelete(id)
  result = {
    status: `${id} terhapus`, 
    data_books: result
  }
  return result;
}

async function updateBooks(parent, {id, title, author, price, date_published}){
  let result = await modelBook.findByIdAndUpdate(
    id,
    {
      title: title,
      author: author,
      price: price,
      date_published: date_published
    },{new: true}
    )
    result = {
      status : `Data ${id} berhasil di Update`,
      data_books: result
    }
    console.log(result)
    return result;
}
// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
      getAllBooks,
      buyBooks,
      getBooksBy
    },

    Mutation: {
      addBooks,
      deleteBooks,
      updateBooks
    }
  };

  module.exports = {resolvers};