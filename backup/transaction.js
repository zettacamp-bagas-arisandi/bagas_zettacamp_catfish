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
async function GetAllTransactions(parent, {filter, page = 1, limit = 5}){
    /// kondisikan skip dan count
    let count = await transactionsModel.count();
    skip = (page-1)*limit;

    /// temp var for query
    let query = {$and:[]};
    let queryAgg = [];

    /// Kondisi untuk parameter, jika ada akan di push ke query $and
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
        filter.order_date = new RegExp(filter.order_date, 'i');
        query.$and.push({
            order_date: filter.order_date
        })
    }

    /// Kondisi jika semua parameter terisi, akan melakukan pipeline match
    if (query.$and.length > 0){
        queryAgg.push(
            {
                $match: query
            }
        )
    }

    /// Panggil pipeline yang ada
    let result = await transactionsModel.aggregate(queryAgg);

    /// Update count
    count = result.length;

    // /// testing moment
    // let cek = moment(new Date('2021-11-10')).locale('id').format('LL')
    // let ceks = moment(new Date(cek)).locale('id').fromNow()
    // console.log(ceks)
  
    /// Apply skip dan limit
    queryAgg.unshift( 
        {
            $skip: skip
        },{
            $limit: limit
        }
        )
        
        /// Pagination Things
    let pages = `${page} / ${Math.ceil(count/limit)}`
    
    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })
 

    // return sesuai typdef
    result = {
        page: pages,
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

/////////////// MUTATION ///////////////
async function DeleteTransactions(parent, {id}){
    try{
    let deleted;
    if(id){
        deleted = await transactionsModel.findByIdAndUpdate(id,{
            status: 'deleted'
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (deleted===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return deleted;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function CreateTransactions(parent, {input}, context){

    /// Ambil user dari token
    let User = jwt.decode(context.req.headers.authorization);
    let id = await modelUser.find({email:User.username})

    /// struktur untuk create
    let creator = {
        id: "TESTING YGY",
        user_id: id[0]._id,
        menu: input.menu,
        order_status: 'failed',
        order_date: moment(new Date()).locale('id').format('LL'),
        status: "active"
    }


    
    /// Validate ////

    /// temp var
    let getRecipes = [];
    let getIngredients = [];

    let validate = [];

    /// load recipes id
    for(const [idx,val] of input.menu.entries()){
        let checkRecipes = await recipesModel.findById(input.menu[idx].recipe_id);
        getRecipes.push(checkRecipes);
    };

    for(const [idx,val] of getRecipes.entries()){
        for(const [idx_ingr, val] of getRecipes[idx].ingredients.entries() ){
            let checkIngredients = await ingrModel.findById(getRecipes[idx].ingredients[idx_ingr].ingredient_id);
            getIngredients.push(checkIngredients);
            if(getRecipes[idx].ingredients[idx_ingr].stock_used * input.menu[idx].amount < checkIngredients.stock){
            validate.push(getRecipes[idx].ingredients[idx_ingr].stock_used * input.menu[idx].amount < checkIngredients.stock )
            }
            // console.log(getRecipes[idx].ingredients[idx_ingr].ingredient_id)
        }
       
    }

    console.log(validate)
  



    return creator;
}

async function ValidateStockIngredients(recipe_id){
    let checkStock =  await recipesModel.find({_id: mongoose.Types.ObjectId(recipe_id)})
    console.log(checkStock)

}

async function ReduceIngredientStock(recipe_id){
    console.log(recipe_id)
}

async function CreateUser(parent,{email, password, first_name, last_name, status}){
    try{
    const addUser = new modelUser({
        email: email, 
        password: password, 
        first_name: first_name, 
        last_name: last_name, 
        status: status
    });
    const added = await addUser.save();
    return addUser;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function UpdateUser(parent, {id, email, first_name, last_name, password}){
    let update;
    if(id){
        update = await modelUser.findByIdAndUpdate(id,{
            email: email, 
            password: password, 
            first_name: first_name, 
            last_name: last_name, 
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (update===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
    
    return update;
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
    },
    Mutation: {
        DeleteTransactions,
        CreateTransactions
    },
    Transactions: {
        user_id: getUserLoader
    },
    transactions_menu:{
        recipe_id: getRecipeLoader
    },
  }

module.exports = { trancsactionsResolvers }


 for(const [idx,val] of getRecipes.entries()){
        for(const [idx_ingr, val] of getRecipes[idx].ingredients.entries() ){
            let checkIngredients = await ingrModel.findById(getRecipes[idx].ingredients[idx_ingr].ingredient_id);
            getIngredients.push(checkIngredients);
            const validateStock = getRecipes[idx].ingredients[idx_ingr].stock_used * input.menu[idx].amount < checkIngredients.stock
            console.log(`${checkIngredients.name}(${getRecipes[idx].ingredients[idx_ingr].stock_used * input.menu[idx].amount}, ${checkIngredients.stock}) => ${validateStock}`)
            checkStatus.push(validateStock)
        }
       
    }