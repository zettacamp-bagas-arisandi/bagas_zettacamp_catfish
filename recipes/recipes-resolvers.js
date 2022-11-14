const recipesModel = require("../models/recipes");
const ingrModel = require("../models/ingredients");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');


//////////////// QUERY ////////////////
async function GetAllRecipes(parent, {name, recipe_name, skip = 0, page = 1, limit = 5}){
     let result;
     /// kondisikan skip dan count
     let count = await recipesModel.count();
     skip = (page-1)*limit;
  
     
     /// temp var for query
     let query = { $and: []};
     let queryAgg = [
        {
            $skip: skip
        },{
            $limit: limit
        }
     ];
 
     /// Kondisi untuk parameter, jika ada akan di push ke query $and
    if(recipe_name){
        recipe_name = new RegExp(recipe_name, 'i');
         query.$and.push({
            recipe_name:recipe_name
         });
        }
 
     /// Kondisi jika semua parameter terisi, akan melakukan pipeline match
     if (query.$and.length > 0){
         queryAgg.unshift(
             {
                 $match: query
             }
         )
        /// Update count jika termatch tanpma melibatkan skip
        let countMatch = await recipesModel.aggregate([{
            $match: query
        }])
        count = countMatch.length;
    }
 
    result = await recipesModel.aggregate(queryAgg);
    
    /// Pagination Things
    let pages = `${page} / ${Math.ceil(count/limit)}`
    
    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })
    
    /// return sesuai typdef
     result = {
             page: pages,
             count: count,
             data_recipes: result,
         }
        
     return result;
 
};

async function GetOneRecipes(parent, {id}){
    let result;
    /// Kondisi untuk parameter, jika ada akan find berdasarkan parameter
    if(id){
        result = await recipesModel.find({_id: mongoose.Types.ObjectId(id)});
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    /// Jika result kosong
    if(result.length < 1 ){
        throw new GraphQLError('Data Tidak Ditemukan');
    }
    return result[0];
};


//////////////// MUTATION ////////////////
async function CreateRecipes(parent, { recipe_name, input} ){
    try{
        /// Validasi ingredients sesuai di database
        for (let ingredientz of input){
            const bahan = await ingrModel.findById(ingredientz.ingredient_id);
            if(!bahan) throw new GraphQLError('Data ingredient_id tidak sesuai')
        }
        const recipes = new recipesModel({
            recipe_name: recipe_name,
            ingredients: input,
        })
   
    await recipes.save();   
    return recipes;
    }catch(err){
        throw new GraphQLError(err)
    }
}

async function UpdateRecipes(parent, {id, recipe_name, input, stock_used}){
    let update;
    if(id){
        update = await recipesModel.findByIdAndUpdate(id,{
            recipe_name: recipe_name,
            ingredients: input,
            stock_used:stock_used
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (update===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return update;
}

async function DeleteRecipes(parent, {id}){
    try{
    let deleted;
    if(id){
        deleted = await recipesModel.findByIdAndUpdate(id,{
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


//////////////// LOADER ////////////////
async function getIngrLoader (parent, args, context){
    if (parent.ingredient_id){
     let cek = await context.ingrLoader.load(parent.ingredient_id)
     return cek
    }
  }

/// temp var resolers to Server
const recipesResolvers = {
    Query: {
        GetAllRecipes,
        GetOneRecipes,
        
    },
    Mutation: {
        CreateRecipes,
        UpdateRecipes,
        DeleteRecipes
    },

    ingredient_id: {
        ids: getIngrLoader
    }
};

module.exports = { recipesResolvers };