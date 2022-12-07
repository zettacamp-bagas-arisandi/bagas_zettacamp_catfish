const jwt = require('jsonwebtoken');
const {GraphQLError} = require('graphql');

async function role (resolve, parent, args, context, info){
    if(context.req.user_role !== 'admin'){
        throw new GraphQLError('Tidak bisa akses selain admin')
    }
    return await resolve (parent, args, context, info)
  }

const middleWareRole = {
  Query: {
    GetAllUser:role,
    // GetOneUser:role,

    GetAllIngredients: role,
    GetOneIngredients: role,

    // GetAllRecipes: role,
    // GetOneRecipes: role,

    // GetAllTransactions: role,
    GetOneTransactions: role,

  },
  Mutation: {
    // CreateUser:role,
    // UpdateUser:role,
    DeleteUser:role,

    CreateIngredients: role,
    UpdateIngredients: role,
    DeleteIngredients: role,

    CreateRecipes: role,
    UpdateRecipes: role,
    DeleteRecipes: role,

    CreateTransactions: role,
    DeleteTransactions: role,

    // IncrAmount: role,
    // DecrAmount: role

    // addCart: role,
    // deleteCart: role

  
}
}

module.exports = {middleWareRole}
