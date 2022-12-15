const recipesModel = require("./recipes-model");
const ingrModel = require("../ingredients/ingredients-model");
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

async function GetAllRecipesNotLogin(parent, {recipe_name, skip = 0, status, is_hightlighted, is_special_offers, category, page = 1, limit = 5}, context){
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

    /// tampilkan yang active saja
    query.$and.push({
        status: "active"
    })
  
    if(is_special_offers === true){
        query.$and.push({
            sold: {$gte: 15}
        })
    }

    if(is_hightlighted === true){
        query.$and.push({
            "is_special_offers.discount": {$gte: 5}
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

   if(category){
    query.$and.push({
        category:category
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
async function CreateRecipes(parent, { recipe_name, input, description, price, image, status = 'unpublish', discount = 1, sold = 0, category} ){
        let check = await recipesModel.findOne({ recipe_name: new RegExp("^" + recipe_name.trim() + "$", 'i') });
        if(check){
            if(check.status!=='deleted')throw new GraphQLError(`${recipe_name} sudah ada!`);
        }else{
        if(!input || input.length < 1){throw new GraphQLError("Ingredient tidak boleh kosong")};
        /// Validasi ingredients sesuai di database
        for (let list of input){
            const bahan = await ingrModel.findById(list.ingredient_id);
            if(!bahan) throw new GraphQLError(`${list.ingredient_id} tidak ada`);
        }

        let calculate = 0;
        if(discount){
            /// kalkulasi price after discount
            if(discount >= 5 && discount <= 75){
                calculate = price - (price * (discount/100))
            }else{
                calculate = price;
            }
        }
        
        const recipes = new recipesModel({
            recipe_name: recipe_name,
            ingredients: input,
            description: description, 
            image: image,
            price: price,
            status: status,
            category: category,
            sold:sold,
            is_special_offers: {
                price_discount: calculate,
                discount: discount
            }
            
        })
   
    await recipes.save();   
    return recipes;
    }

}

async function UpdateRecipes(parent, {id, recipe_name, input, stock_used, description, price, image, status, discount = 0, category}){
    let update;

    let getRecipes = await recipesModel.findById(id);
    
    if(id){

        /// fix overwriting
        if(!input){
            input = getRecipes.ingredients;
        }

        if(!stock_used){
            stock_used = getRecipes.stock_used;
        }

        if(!recipe_name){
            recipe_name = getRecipes.recipe_name;
        };

        if(!category){
            category = getRecipes.category;
        }

        if(!description){
            description = getRecipes.description;
        }

        /// mengkondisikan special offers 
        if(!price){
            price = getRecipes.price;
        };

        if(!image){
            image = getRecipes.image;
        }

        if(!status){
            status = getRecipes.status
        }
    
        if(!discount){
            discount = getRecipes.is_special_offers.discount
        };

        /// kalkulasi price after discount
        let calculate = 0;
        if(discount >= 5 && discount <= 75){
            calculate = price - (price * (discount/100))
        }else{
            calculate = getRecipes.price;
        }
       
        update = await recipesModel.findByIdAndUpdate(getRecipes._id,{
            recipe_name: recipe_name,
            ingredients: input,
            stock_used:stock_used,
            category:category,
            description: description,
            price: price,
            image: image,
            status: status,
            is_special_offers: {
                price_discount:calculate,
                discount: discount
            }
        },{new: true});   

        
    }else{
        throw new GraphQLError(`parameter id tidak terbaca`);
    }

    if (update===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return update;
}

async function DeleteRecipes(parent, {id}){
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
    },
};

module.exports = { recipesResolvers };