const jwt = require('jsonwebtoken');
const {GraphQLError} = require('graphql');

async function auth (resolve, parent, args, context, info){
  if(!context.req.headers.authorization){
    throw new GraphQLError('Silakan Login')
  }
    token = context.req.headers.authorization;
    jwt.verify(token, 'zetta', (err,decode) => {
        if(err){
            throw new GraphQLError(err)
        }
        context.req.user_type = decode.user_type; 
        context.req.user_role = decode.role;
        context.req.user_id = decode.user_id;
    });
    return resolve(parent, args, context, info);
  }

const middleWareAuth = {
  Query: {
    GetAllUser:auth,
    GetOneUser:auth,

    GetAllIngredients: auth,
    GetOneIngredients: auth,

    GetAllRecipes: auth,
    GetOneRecipes: auth,

    GetAllTransactions: auth,
    GetOneTransactions: auth,

  },
  Mutation: {
    CreateUser:auth,
    UpdateUser:auth,
    DeleteUser:auth,

    CreateIngredients: auth,
    UpdateIngredients: auth,
    DeleteIngredients: auth,

    CreateRecipes: auth,
    UpdateRecipes: auth,
    DeleteRecipes: auth,

    CreateTransactions: auth,
    DeleteTransactions: auth,
    CreateTransactions: auth,

  
}
}

module.exports = {middleWareAuth}
