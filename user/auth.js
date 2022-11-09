const jwt = require('jsonwebtoken');
const {GraphQLError} = require('graphql');

async function auth (resolve, parent, args, context, info){
  if(!context.req.headers.authorization){
    throw new GraphQLError('Silakan Login')
  }
    token = context.req.headers.authorization;
    jwt.verify(token, 'zetta', (err) => {
        if(err){
            throw new GraphQLError(err)
        }
    });
    return await resolve(parent, args, context, info);
  }


const middleWare = [{
  Query: {
    GetAllUser:auth,
    GetOneUser:auth,
  },
  Mutation: {
    CreateUser:auth,
    UpdateUser:auth,
    DeleteUser:auth,
}
}]

module.exports = {middleWare}