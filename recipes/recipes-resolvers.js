const recipesModel = require("../models/recipes");
const ingrModel = require("../models/ingredients");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');


//////////////// QUERY ////////////////
async function GetAllRecipes(parent, {recipe_name, skip = 0, status, is_hightlighted, is_special_offers, page = 1, limit = 5}, context){
     let result;
      
     /// kondisikan skip dan count
     let count = await recipesModel.count();
     skip = (page-1)*limit;
  
     
     /// temp var for query match
     let query = { $and: []};
     let queryAgg = [
        {
            $skip: skip
        },{
            $limit: limit
        }
     ];

     /// jika bukan selain admin tampilkan yg active saja
     if(context.req.user_role !== "admin"){
        query.$and.push({
            status: "active"
        })
     }
 
     /// filter by recipe name, jika ada akan di push ke query $and
    if(recipe_name){
        recipe_name = new RegExp(recipe_name, 'i');
         query.$and.push({
            recipe_name:recipe_name
         });
        }
    
    /// filter by status
    if(status){
         query.$and.push({
            status:status
         });
    }

    /// filter by special offers
    if(is_special_offers){
        query.$and.push({
            is_special_offers:is_special_offers
         });
    }

    /// filter by hightlighted
    if(is_hightlighted){
        query.$and.push({
            is_hightlighted:is_hightlighted
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
    // console.log(query)
    result = await recipesModel.aggregate(queryAgg);
    
    /// Pagination Things
    let pages = page;
    let maxpages = Math.ceil(count/limit);
    
    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })
    

    /// return sesuai typdef
     result = {
             page: pages,
             maxPage: maxpages,
             count: count,
             data_recipes: result
         }
        
     return result;
 
};

async function GetAllRecipesNotLogin(parent, {recipe_name, skip = 0, status, is_hightlighted, is_special_offers, page = 1, limit = 5}, context){
    let result;

    /// kondisikan skip dan count
    let count = await recipesModel.count();
    skip = (page-1)*limit;
 
    
    /// temp var for query match
    let query = { $and: []};
    let queryAgg = [
       {
           $skip: skip
       },{
           $limit: limit
       }
    ];

    /// jika bukan selain admin tampilkan yg active saja
 
    query.$and.push({
        status: "active"
    })
  

    /// filter by recipe name, jika ada akan di push ke query $and
   if(recipe_name){
       recipe_name = new RegExp(recipe_name, 'i');
        query.$and.push({
           recipe_name:recipe_name
        });
       }
   
   /// filter by status
   if(status){
        query.$and.push({
           status:status
        });
   }

   /// filter by special offers
   if(is_special_offers){
       query.$and.push({
           is_special_offers:is_special_offers
        });
   }

   /// filter by hightlighted
   if(is_hightlighted){
       query.$and.push({
           is_hightlighted:is_hightlighted
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
   // console.log(query)
   result = await recipesModel.aggregate(queryAgg);
   
   /// Pagination Things
   let pages = page;
   let maxpages = Math.ceil(count/limit);
   
   /// Fixing id null
   result = result.map((el) => {
       el.id = mongoose.Types.ObjectId(el._id);
       return el;
   })
   

   /// return sesuai typdef
    result = {
            page: pages,
            maxPage: maxpages,
            count: count,
            data_recipes: result
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
async function CreateRecipes(parent, { recipe_name, input, description, price, image, status, is_special_offers, discount, is_hightlighted} ){
        /// Validasi ingredients sesuai di database dan active
        for (let ingredientz of input){
            const bahan = await ingrModel.findById(ingredientz.ingredient_id);
            if(!bahan) throw new GraphQLError(`${ingredientz.ingredient_id} tidak ada`);
            if(bahan.status !== 'active') throw new GraphQLError(`${bahan.name} tidak bisa digunakan`);
        }
        const recipes = new recipesModel({
            recipe_name: recipe_name,
            ingredients: input,
            description: description, 
            image: image,
            price: price,
            status: status,
            is_hightlighted: is_hightlighted,
            is_special_offers: {
                status: is_special_offers,
                discount: discount
            }
            
        })
   
    await recipes.save();   
    return recipes;

}

async function UpdateRecipes(parent, {id, recipe_name, input, stock_used, description, price, image, status, status_hightlighted, status_special_offers, discount}){
    let update;
    if(id){
        update = await recipesModel.findByIdAndUpdate(id,{
            recipe_name: recipe_name,
            ingredients: input,
            stock_used:stock_used,
            description: description,
            price: price,
            image: image,
            status: status,
            is_hightlighted: status_hightlighted,
            is_special_offers: {
                status: status_special_offers,
                discount: discount
            }
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError(`parameter id tidak terbaca`);
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
        throw new GraphQLError('parameter id tidak terbaca');
    }

    if (deleted===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return deleted;
    }catch(err){
        throw new GraphQLError(err)
    }
}

//////////////// LOADER ////////////////
async function getIngrLoader (parent, args, context){
    if (parent.ingredient_id){
     let cek = await context.ingrLoader.load(parent.ingredient_id)
     return cek
    }
  }

async function getRemainOrder (parent, args, context){
    const Stocks = []
    for (const ingr of parent.ingredients){
        const ingredients = await ingrModel.findById(ingr.ingredient_id)
        Stocks.push(Math.floor(ingredients.stock/ingr.stock_used))
    }
    return Math.min(...Stocks)
}

/// temp var resolers to Server
const recipesResolvers = {
    Query: {
        GetAllRecipes,
        GetOneRecipes,
        GetAllRecipesNotLogin
        
    },
    Mutation: {
        CreateRecipes,
        UpdateRecipes,
        DeleteRecipes
    },

    ingredient_id: {
        ids: getIngrLoader
    },

    Recipes: {
        remain_order: getRemainOrder
    }
};

module.exports = { recipesResolvers };