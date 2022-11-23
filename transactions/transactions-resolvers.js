const moment = require('moment');
const modelUser = require("../models/user");
const transactionsModel = require("../models/transactions");
const recipesModel = require("../models/recipes");
const ingrModel = require('../models/ingredients');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { ApolloError } = require('apollo-server');

/////////////// QUERY ///////////////
async function GetAllTransactions(parent, {filter, page = 1, limit = 10}){
    /// kondisikan skip dan count
    let count = await transactionsModel.count();
    skip = (page-1)*limit;

    /// temp var for query
    let query = {$and:[]};
    let queryAgg = [    
        {
            $skip: skip
        },{
            $limit: limit
        }
    ];
    let result;

    /// Kondisi untuk parameter, jika ada akan di push ke query $and
if(filter){
    if(filter.last_name_user){
        filter.last_name_user = new RegExp(filter.last_name_user, 'i');
        query.$and.push({ "users_populate.last_name": filter.last_name_user })
        queryAgg.push(
            {
                $lookup:
                {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "users_populate"
                }
            }
        )
    };
       
    if(filter.recipe_name){
        filter.recipe_name = new RegExp(filter.recipe_name, 'i');
        query.$and.push({ "recipes_populate.recipe_name": filter.recipe_name })
        queryAgg.push(
            {
                $lookup:
                {
                    from: "recipes",
                    localField: "menu.recipe_id",
                    foreignField: "_id",
                    as: "recipes_populate"
                }
            }
        )
    };

    if(filter.order_status){
        query.$and.push({
            order_status: filter.order_status
        });
    }

    if(filter.order_date){
        filter.order_date = moment(filter.order_date).locale('id').format('LL');
        filter.order_date = new RegExp(filter.order_date, 'i');
        console.log(filter.order_date)
        query.$and.push({
            order_date: filter.order_date
        })
    }
}
    /// Kondisi jika semua parameter terisi, akan melakukan pipeline match 
    if (query.$and.length > 0){
        queryAgg.push(
            {
                $match: query
            }
        )

        let countMatch = await transactionsModel.aggregate([{
            $match: query
        }])
        count = countMatch.length;
    };
    /// Panggil pipeline yang ada
    result = await transactionsModel.aggregate(queryAgg);
    if(result.length > 0){
        count = result.length;
    }

    /// Pagination Things
    let pages = page;
    let maxPages = Math.ceil(count/limit);
    
    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })
 
    // return sesuai typdef
    result = {
        page: pages,
        maxPage: maxPages,
        count: count,
        data: result,
    }
    return result;

}

async function GetOneTransactions(parent, {id}){
    let result;
    /// Kondisi untuk parameter, jika ada akan find berdasarkan parameter
    if(id){
        result = await transactionsModel.find({_id: mongoose.Types.ObjectId(id)});
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    /// Jika result kosong
    if(result.length < 1 ){
        throw new GraphQLError('Data Tidak Ditemukan');
    }
    return result[0];
}

async function GetOrder(parent, _, context){
    let result =  await transactionsModel.findOne({order_status: 'pending', user_id: context.req.user_id});
    // console.log(result)
    if(!result){
        throw new GraphQLError('User ini belum pernah add item to cart ygy')
    }

    const menus = result.menu;
    let totalPrice = 0;
    for(let menu of menus){
        let recipe = await recipesModel.findById(menu.recipe_id)
        totalPrice += (menu.amount * recipe.price)
    }
    // console.log(totalPrice)
    return result
    
}

/////////////// MUTATION ///////////////
async function DeleteTransactions(parent, {id}){
    try{
    let deleted;
    if(id){
        deleted = await transactionsModel.findByIdAndUpdate(id,{
            status: 'deleted'
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('id tidak ditemukan');
    }

    if (deleted===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return deleted;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function addCart(parent, {input}, context ){
  try{
    /// cek dulu ada gak ya
    let transaction = await transactionsModel.findOne({$and:[{order_status: 'pending'}, {user_id: context.req.user_id}]});
    let add;
    if(!transaction){

        /// bikin transaction baru kalo belom ada
        add = {
            user_id: context.req.user_id,
            menu: input,
            order_status: 'pending',
            order_date: moment(new Date()).locale('id').format('LL'),
        }

        /// cari price
        let price = await recipesModel.findById(input.recipe_id)
        
        /// total price awal
        add.total_price = price.price * input.amount

        add = new transactionsModel(add);
        await add.save();
        
        return add;
    }else{
        /// kalo udah ada ngepush menunya aja
        add = await transactionsModel.findByIdAndUpdate(transaction._id, 
            {
                $push: {
                    menu: input,
                },
            },{new: true}
            )
        }
        /// update juga total pricenya stiap ngepush
        add = await transactionsModel.findByIdAndUpdate(transaction._id, 
            {
                total_price: await getTotalPrice(add)
            },{new: true}
            )
       
        return add;
  }catch(err){
    throw new GraphQLError(err)
  }
}

async function deleteCart(parent, {id}, context ){
    try{
        /// cari dulu transaksinya
        const transaction = await transactionsModel.findOne({$and:[{order_status: 'pending'}, {user_id: context.req.user_id}]});
        
        /// cek dulu dia mesen nggak
        const recipes = await transactionsModel.find({ menu: { $elemMatch: { _id: mongoose.Types.ObjectId(id) } } })
        
        /// kalo iya
        if(recipes.length){
            let edit = await transactionsModel.findByIdAndUpdate(transaction._id, 
                {
                    $pull: {
                        menu: {_id: mongoose.Types.ObjectId(id)}
                    },
                },{new: true}
                )

                /// update total price setiap ngepull
                edit = await transactionsModel.findByIdAndUpdate(transaction._id, 
                    {
                        total_price: await getTotalPrice(edit, transaction._id)
                    },{new: true}
                    )

                return edit
        }else{
            //// kasi error gak ada menunya
            throw new GraphQLError('Recipe atau Menu tidak ditemukan');
        }
    }catch(err){
      throw new GraphQLError(err)
    }
}

async function OrderNow(parent,{id}, context){
    try{
        let transaction = await transactionsModel.findById(id);
        if(transaction.order_status !== 'pending') throw new GraphQLError('Order sudah selesai');
        if(transaction.menu.length<1) throw new GraphQLError('Pilih Menu dulu dong baru order')
        transaction = await validateStockIngredient(transaction,id);
        return transaction;
    }catch(err){
        throw new GraphQLError(err)
    }

}

async function EditNote(parent,{id, newNote}, context){
    console.log(`Edit Note Running: ${id} : ${newNote}`)
    let transaction = await transactionsModel.findOne({$and:[{order_status: 'pending'}, {user_id: context.req.user_id}]});
    let edit = await transactionsModel.updateMany( { },
        { "menu.$[elem].note" : newNote  },
        { arrayFilters: [ { "elem._id": mongoose.Types.ObjectId(id)} ]},)
        console.log(newNote)
    return {status: newNote}
}

async function CreateTransactions(parent, {input}, context){
try{
    if(input){
        /// struktur untuk create
        let creator = new transactionsModel({
            user_id: context.req.user_id,
            menu: input.menu,
            order_status: 'pending',
            order_date: moment(new Date()).locale('id').format('LL'),
            total_price: 0
        });
        
        /// Validate ////
        creator = await validateStockIngredient(creator, input);
        await creator.save();
        return creator;
        }else{
            throw new GraphQLError('Masukkan parameter')
        }
    }
    catch(err){
        throw new GraphQLError(err)
    }
}

/////////////// ANOTHER FUNCTION  ///////////////
async function reduceIngredientStock(ids,stockUsed){
    for (const [index, _] of ids.entries()){
        const reduce = await ingrModel.findByIdAndUpdate(ids[index],{
          stock: stockUsed[index]
        })
      }
}

async function getTotalPrice(creator){
    let cek = 0;
   
    if (creator.menu.length<1) return creator.price_amount = 0;
        for (const price of creator.menu){
            const checkRecipes = await recipesModel.findById(price.recipe_id);
            let total = checkRecipes.price * price.amount;
            cek += total;
            creator.price_amount = cek;
        }
   return creator.price_amount;
}


async function validateStockIngredient(creator, id){
     /// temp var
     let checkStatus = [];
     let stock_usedCalculate = [];
     let getIngredientsId = [];

    for(const recipes of creator.menu){
        const checkRecipes = await recipesModel.findById(recipes.recipe_id);
        for (const ingredient of checkRecipes.ingredients){
            getIngredientsId.push(ingredient.ingredient_id);
            const checkIngredients = await ingrModel.findById(ingredient.ingredient_id);
            const tempStatus = ingredient.stock_used * recipes.amount <= checkIngredients.stock && checkIngredients.status === 'active';
            stock_usedCalculate.push(checkIngredients.stock - ingredient.stock_used * recipes.amount);
            checkStatus.push(tempStatus);
        }
    };

    if (!checkStatus.includes(false)){
        creator.order_status = 'success';
        reduceIngredientStock(getIngredientsId,stock_usedCalculate);
    }else{
        creator.order_status = 'failed';
    }


    /// update status order
    creator = await transactionsModel.findByIdAndUpdate(id,
        {
            order_status: creator.order_status, 
            total_price: await getTotalPrice(creator)
        },{new: true})
    return creator;
}

async function IncrAmount(parent, {id}, context){
    try{
        let edit = await transactionsModel.updateMany(
            { },
            { $inc: { "menu.$[elem].amount" : 1 } },
            { arrayFilters: [ { "elem._id": mongoose.Types.ObjectId(id)} ]},
         )
         
        const transaction = await transactionsModel.findOne({$and:[{order_status: 'pending'}, {user_id: context.req.user_id}]});
        let add = await transactionsModel.findByIdAndUpdate(transaction._id, 
            {
                total_price: await getTotalPrice(transaction)
            },{new: true}
            )
       

        return {status: "Berhasil menambahkan Amount"};
    }catch(err){
        throw new GraphQLError(err)
    }
}

async function DecrAmount(parent, {id}, context){
    try{
        let edit = await transactionsModel.updateMany(
            { },
            { $inc: { "menu.$[elem].amount" : -1 } },
            { arrayFilters: [ { "elem._id": mongoose.Types.ObjectId(id)} ]},
         )
         const transaction = await transactionsModel.findOne({$and:[{order_status: 'pending'}, {user_id: context.req.user_id}]});
         let add = await transactionsModel.findByIdAndUpdate(transaction._id, 
            {
                total_price: await getTotalPrice(transaction)
            },{new: true}
            )
        //  console.log(edit)
        return {status: "Berhasil mengurangi Amount"};
    }catch(err){
        throw new GraphQLError(err)
    }
}


/////////////// LOADER  ///////////////
async function getUserLoader (parent, args, context){
    if (parent.user_id){
     let cek = await context.userLoader.load(parent.user_id)
     return cek
    }
}

async function getRecipeLoader (parent, args, context){
//console.log(parent.recipe_id)
if (parent.recipe_id){
    let cek = await context.recipeLoader.load(parent.recipe_id)
    return cek
}
}

const trancsactionsResolvers = {
    Query: {
        GetAllTransactions,
        GetOneTransactions,
        GetOrder
    },
    Mutation: {
        DeleteTransactions,
        CreateTransactions,
        addCart,
        deleteCart,
        OrderNow,
        IncrAmount,
        DecrAmount,
        EditNote
    },
    Transactions: {
        user_id: getUserLoader
    },
    transactions_menu:{
        recipe_id: getRecipeLoader
    },
  }

module.exports = { trancsactionsResolvers }