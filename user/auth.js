const jwt = require('jsonwebtoken');
const {GraphQLError} = require('graphql');
const moment = require('moment');

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
        context.req.user_firstName = decode.first_name;
        console.log(decode.email, decode.role, moment(new Date()).locale('id').format('LLL') )
    });
    return resolve(parent, args, context, info);
  }

const middleWareAuth = {
  Query: {
    GetAllUser:auth,
    // GetOneUser:auth,

    GetAllIngredients: auth,
    GetOneIngredients: auth,

    GetAllRecipes: auth,
    // GetOneRecipes: auth,

    GetAllTransactions: auth,
    GetOneTransactions: auth,
    
    GetOrder: auth

  },
  Mutation: {
    // CreateUser:auth,
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

    addCart: auth,
    deleteCart: auth,
    OrderNow: auth,
    IncrAmount: auth,
    DecrAmount: auth,
    EditNote: auth


  
}
}

module.exports = {middleWareAuth}
