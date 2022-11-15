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
try{
    /// struktur untuk create
    let creator = new transactionsModel({
        user_id: context.req.user_id,
        menu: input.menu,
        order_status: 'failed',
        order_date: moment(new Date()).locale('id').format('LL')
    });
    
    /// Validate ////
    creator = await validateStockIngredient(creator, input);
    //await creator.save();
    return creator;
    }catch(err){
        throw new GraphQLError(err)
    }
}


/////////////// CREATE VALIDATE  ///////////////

async function reduceIngredientStock(ids,stockUsed){
    for (const [index, _] of ids.entries()){
        const reduce = await ingrModel.findByIdAndUpdate(ids[index],{
          stock: stockUsed[index]
        })
      }
}

async function validateStockIngredient(creator, input){
     /// temp var
     let checkStatus = [];
     let stock_usedCalculate = [];
     let getIngredientsId = [];

    for(const recipes of input.menu){
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
    }
    return creator;
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