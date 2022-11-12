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
    CreateTransactions: auth,
}
}]

module.exports = {middleWare}


const authJwt = async(resolver,parent, args, ctx)=>{
  let auth = ctx.req.get('Authorization')  /// replacenya coba dibawah
  if(!auth){
      throw new ApolloError('Gak Bisa Akese')
  }else{
      auth =  auth.replace("Bearer ", ""); /// pindah sini
      const verify = jwt.verify(auth, tokenSecret);
      const getUser = await User.find({
          _id : verify.userId
      });
      ctx.user = getUser;
      ctx.token = auth
  }
  return resolver()
}