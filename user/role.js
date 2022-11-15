const jwt = require('jsonwebtoken');
const {GraphQLError} = require('graphql');

async function role (resolve, parent, args, context, info){
    let getRole = context.req.headers.authorization;
    getRole = jwt.decode(getRole).role;
    
    if (getRole !== 'admin'){
        throw new GraphQLError('User tidak bisa mengakses ini');
    }

    return await resolve (parent, args, context, info)
  }

const middleWareRole = {
  Query: {
    GetAllUser:role,
    GetOneUser:role,

    GetAllIngredients: role,
    GetOneIngredients: role,

    GetAllRecipes: role,
    GetOneRecipes: role,

    GetAllTransactions: role,
    GetOneTransactions: role,

  },
  Mutation: {
    CreateUser:role,
    UpdateUser:role,
    DeleteUser:role,

    CreateIngredients: role,
    UpdateIngredients: role,
    DeleteIngredients: role,

    CreateRecipes: role,
    UpdateRecipes: role,
    DeleteRecipes: role,

    CreateTransactions: role,
    DeleteTransactions: role,
    CreateTransactions: role,

  
}
}

module.exports = {middleWareRole}
