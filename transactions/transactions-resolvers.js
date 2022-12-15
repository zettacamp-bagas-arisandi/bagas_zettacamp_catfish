
const moment = require('moment');
const modelUser = require("../user/user-model");
const transactionsModel = require("./transactions-model");
const recipesModel = require("../recipes/recipes-model");
const ingrModel = require('../ingredients/ingredients-model');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { ApolloError } = require('apollo-server');

/////////////// QUERY ///////////////
async function GetAllTransactions(parent, 
    {   
        /// args/parameter filter
        first_name_user, last_name_user, recipe_name, order_status, order_date, page = 1, limit = 5,
        /// sorting
        sortUserName, sortTotalPrice, sortDate, sortMenu
    }, 
    context){
    let result;

    /// kondisikan skip dan count
    let count = await transactionsModel.count();
    skip = (page-1)*limit;
    
    /// temp var for query untuk matching
    let query = {$and:[]};
    let queryLookUp = {$and:[]};

    /// queary default
    let queryAgg = [];

     // match berdasarkan user jika dia bukan admin
    if(context.req.user_role === 'user'){
        query.$and.push({
             user_id: mongoose.Types.ObjectId(context.req.user_id)
        })
    }


/// Kondisi untuk parameter, jika ada akan di push ke query $and


    /// kondisi jika pakai sort by date
    if(sortDate!==undefined){
        /// temp var
        let sortBy;

        /// menentukan asending atau descending
        if(sortDate === true || sortDate === null){
            sortBy = -1
        }else{
            sortBy = 1
        }
        
        /// push query agg nya
        queryAgg.push({
            $sort:{
                createdAt: sortBy
            }
        });
    }
    else{
        /// defaultnya berdasarkan date terbaru
        queryAgg.push({
            $sort:{
                createdAt: -1
            }
        })
    }



    if(last_name_user || first_name_user || sortUserName!== undefined){
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

        if(last_name_user){
            last_name_user = new RegExp(last_name_user, 'i');
            queryLookUp.$and.push({ "users_populate.last_name": last_name_user })
        }

        if(first_name_user){
            first_name_user = new RegExp(first_name_user, 'i');
            queryLookUp.$and.push({ "users_populate.first_name": first_name_user })
        }


         /// menentukan asending atau descending
        if(sortUserName === true || sortUserName === null){
            sortBy = -1
        }else{
            sortBy = 1
        }

         queryAgg.push({
            $sort: {
                "users_populate.first_name": sortBy
            }
        })
       
        

    };


       
    if(recipe_name || sortMenu !== undefined){
        recipe_name = new RegExp(recipe_name, 'i');
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
        queryLookUp.$and.push({ "recipes_populate.recipe_name": recipe_name });

        /// sort
        let sortBy;
        if(sortMenu === true){
            sortBy = -1;
        }else{
            sortBy = 1;
        }

        queryAgg.push({
            $sort: {
                "recipes_populate.recipe_name": sortBy
            }
        })

    };

    if(order_status){
        query.$and.push({
            order_status: order_status
        });
    }

    if(order_date){
        order_date = moment(order_date).locale('id').format('LL');
        order_date = new RegExp(order_date, 'i');
        // console.log(order_date)
        query.$and.push({
            order_date: order_date
        })
    }


    if(sortTotalPrice!== undefined){
        let sortBy;
        if(sortTotalPrice === true){
           sortBy = -1
        }else{
            sortBy = 1
        }

         queryAgg.push({
            $sort:{
                total_price: sortBy
            }
        })
    }

    /// Kondisi jika semua parameter terisi, akan melakukan pipeline match 
    if (query.$and.length > 0){
        queryAgg.unshift(
            {
                $match: query
            }
        )
    };

    if(queryLookUp.$and.length > 0){
        queryAgg.push(
            {
                $match: queryLookUp
            }
        )
    }

    /// update count
    if(queryLookUp.$and.length || query.$and.length){
        let countMatch = await transactionsModel.aggregate(queryAgg);
        count = countMatch.length;
    }

    /// apply pagination
    queryAgg.push(
            {
                $skip: skip
            },{
                $limit: limit
            }
        )

    /// Panggil pipeline yang ada + skip limit
    result = await transactionsModel.aggregate(queryAgg);

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
    console.log(queryAgg)
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
    
    const menus = result.menu;
    for(let menu of menus){
        let recipe = await recipesModel.findById(menu.recipe_id);
        if(recipe.remain_order < 1){console.log(`Saat ini ${recipe.recipe_name} sedang habis`);}
        if(recipe.status !== 'active'){console.log(`Saat ini ${recipe.recipe_name} sedang tidak bisa dipesan`);}
        if(!recipe){throw new GraphQLError("Menu tidak ada dalam list")};
    }   
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
        if(price.is_special_offers.discount >= 5){
            add.total_price = price.is_special_offers.price_discount * input.amount;
        }else{
            add.total_price = (price.price*input.amount);
        }


        add = new transactionsModel(add);
        await add.save();
        
        return add;
    }else{

        /// cek menunya dah ada di cart belom
        add = await transactionsModel.find({
        
            _id: mongoose.Types.ObjectId(transaction._id),
            menu: {
                $elemMatch: { recipe_id: mongoose.Types.ObjectId(input.recipe_id), note: input.note } 
                
            } 
        })

       /// kalo ada gak bisa add lagi
       if(add.length > 0 ){
            throw new GraphQLError('Pesanan sudah ada didalam Cart')
        }
        
       }

       /// Push menunya
       add = await transactionsModel.findByIdAndUpdate(transaction._id, 
        {
            $push: {
                menu:input
            }
        },{new: true}
        )
       
        /// update juga total pricenya stiap perubahan
        add = await transactionsModel.findByIdAndUpdate(transaction._id, 
            {
                total_price: await getTotalPrice(add)
            },{new: true}
            )
       
        return add;
 
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
    let transaction = await transactionsModel.findById(id);
    if(transaction.order_status !== 'pending') throw new GraphQLError('Order sudah selesai');
    if(transaction.menu.length<1) throw new GraphQLError('Silahkan pilih menu sebelum order');
    transaction = await validateStockIngredient(transaction,id, context);
    return transaction;
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
async function reduceBalance(total_price, context){
    let reduce = await modelUser.findByIdAndUpdate(context, {
        $inc : {
            balance: -total_price
            }
    }); 
}

async function reduceIngredientStock(ids,stockUsed){
    for (const [index, _] of ids.entries()){
        const reduce = await ingrModel.findByIdAndUpdate(ids[index],{
          $inc : {
            stock: -stockUsed[index]
          }
        })
      }
}

async function getTotalPrice(creator){
    let prices = 0;
    if (creator.menu.length<1) return creator.price_amount = 0;
    for (const price of creator.menu){
        const checkRecipes = await recipesModel.findById(price.recipe_id);
        let total = checkRecipes.is_special_offers.price_discount * price.amount;
        prices += total;
        }

        creator.price_amount = prices;
    return creator.price_amount;
}


async function validateStockIngredient(creator, id, context){
     /// temp var
    let checkStatus = [];
    let ingrMap = [];
    let usedStock = [];

    let map = new Map();

    for (const menu of creator.menu){
        const getMenu = await recipesModel.findById(menu.recipe_id);
        for(const ingredients of getMenu.ingredients){
            const getIngredient = await ingrModel.findById(ingredients.ingredient_id);
            // console.log(map.has(getIngredient.name), getIngredient.name)
            if(map.has(getIngredient.name)){
                let min = getIngredient.stock - ingredients.stock_used * menu.amount;
                map.set(getIngredient.name, min-=ingredients.stock_used * menu.amount)
            }else{
                map.set(getIngredient.name, getIngredient.stock - ingredients.stock_used * menu.amount);
            }

            ingrMap.push(ingredients.ingredient_id);
            usedStock.push(ingredients.stock_used * menu.amount) 
            if(ingredients.stock_used * menu.amount <= getIngredient.stock){
                checkStatus.push(true)
            }else{
                checkStatus.push(false)
            }
        }
    }
    
    let cekStock = [];
    map.forEach((val,key) => {
        if(val < 0){
            cekStock.push(key)
        }    
    });

    /// validate user balance
    let balanceUser = await modelUser.findById(context.req.user_id);

    if(balanceUser.balance < creator.total_price){
        throw new GraphQLError(`Saldo anda tidak mencukupi`);
    }
        
    if(cekStock.length>0){
        throw new GraphQLError(`Stok menu ini tidak mencukupi`);
    }

    // if (!checkStatus.includes(false)){

        reduceBalance(creator.total_price, context.req.user_id)
        reduceIngredientStock(ingrMap,usedStock);
        creator.order_status = 'success';

        /// update sold at recipe
        for( const menu of creator.menu){
            let update = await recipesModel.findByIdAndUpdate(menu.recipe_id,{
                $inc : {
                    sold: menu.amount
                  }
            })
        }
    // }else{
    //     creator.order_status = 'failed';
    // }


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