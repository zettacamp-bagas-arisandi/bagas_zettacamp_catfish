const modelBook = require("./models/model.js");
const modelBookShelf = require("./models/bookshelf.js");
const modelUser = require("./models/user.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

let activeUser = {};

////Query////

async function getAllBooks(parent, {page = 1, skip = 0, limit = 0}){
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

async function getBookShelf(){
  //console.log(activeUser);
  let result;

  if (activeUser.active === true){
    return result = await modelBookShelf.find({});
  }else{
    throw new GraphQLError('Login dulu mas');
  }
  
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


////Loader////
async function getBooksLoader (parent, args, context){
  if (parent.books_id){
   let cek = await context.bookloaders.load(parent.books_id)
   //console.log(cek)
   return cek
  }
}

////Login////

function generateAccessToken(payload) {
  return jwt.sign(payload, 'zetta', { expiresIn: '1h' });
}

async function login(parent, {username, password, secret}, context) {

  let userCheck = await modelUser.find({username: username});
  let status;
  activeUser = userCheck[0];
 
  if (userCheck.length < 1){
    return {status : `${username} tidak ditemukan`};
  }

  if (activeUser.username == username && activeUser.password == password ){
    const token =  generateAccessToken({ username: username, password: password, secret: secret });
    //console.log(activeUser)
    return {status: token}
  }else{
    return {status: 'Cek kembali password anda'}
  }
}

async function auth(parent, {token}){
  let status;
  const tokenCheck = jwt.decode(token)
  const getUser = tokenCheck.username;
  const getPass = tokenCheck.password;
  const getSecret = tokenCheck.secret;
  
  //console.log(tokenCheck)


  if(getUser == activeUser.username && getPass == activeUser.password){
    
      jwt.verify(token, getSecret, (err) => {
       
      if (err){
        return status = err;
      }
      activeUser.active = true;
      status = "Behasil Login";
      })
  }else{
      status = "Cek kembali username dan password anda";
  }
  return {status}
}

// Provide resolver functions for your schema fields
let resolvers = {
    Query: {
      login,
      auth, 
      getAllBooks,
      buyBooks,
      getBooksBy,
      getBookShelf
    },

    Mutation: {
      addBooks,
      deleteBooks,
      updateBooks
    },

    BookShelf_bookIds: {
      books_id: getBooksLoader
    }
  };


  module.exports = {resolvers};
  