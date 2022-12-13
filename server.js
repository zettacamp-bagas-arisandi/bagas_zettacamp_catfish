/// Import Library
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const { merge } = require('lodash');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { applyMiddleware } = require ('graphql-middleware');


/// Import Loader
const ingrLoader = require('./ingredients/ingredients-loader');
const userLoader = require('./user/user-loader.js');
const recipeLoader = require('./recipes/recipe-loader');

/// Import things from user
const { userTypeDefs } = require('./user/user-typedefs.js');
const { userResolvers } = require('./user/user-resolvers.js'); 
const { middleWareAuth } = require('./user/auth');
const { middleWareRole } = require('./user/role');

/// Import things from ingredients
const { ingrResolvers } = require('./ingredients/ingredients-resolvers.js');
const { ingrTypeDefs } = require('./ingredients/ingredients-typedefs.js');

/// Import things from recipes
const { recipesResolvers } = require('./recipes/recipes-resolvers');
const { recipesTypeDefs } = require('./recipes/recipes-typedefs');

/// Import things from transactions
const { trancsactionsTypeDefs } = require('./transactions/transactions-typedefs');
const { trancsactionsResolvers } = require('./transactions/transactions-resolvers');


/// Merge typedefs
const typeDefs = [
  userTypeDefs,
  ingrTypeDefs,
  recipesTypeDefs,
  trancsactionsTypeDefs

]

//// Merge resolvers
const resolvers = merge(
  userResolvers,
  ingrResolvers,
  recipesResolvers,
  trancsactionsResolvers
)

/// Schema for apollo
const schema = makeExecutableSchema({ typeDefs, resolvers })
const schemaWithMiddleware = applyMiddleware(schema, middleWareAuth, middleWareRole )
const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context: function({req}){
        return {
          ingrLoader,
          userLoader,
          recipeLoader,
          req}
    }  
})


/// function to start db and apollo server
async function start(typeDefs, resolvers){
    // const url = 'localhost:27017';
    // const portdb = 27017;
    const database = 'zettacamp';

    /// connect with atlas
    const url = `mongodb+srv://notes:notes123@mini-project.slwlqew.mongodb.net/${database}?retryWrites=true&w=majority`;

// function connect to db
const connectDB = async () => {
    try {
      await mongoose.connect(`${url}`);
      console.log(`Connected to ${database}: Atlas`);
    } catch (err) {
      console.log('Failed to connect to MongoDB', err);
    }
  }

  connectDB();
  await server.listen({ port: 4000 });
  console.log(`Connected to Server: 4000`);
  
}

/// Start the server
start(typeDefs,resolvers);


