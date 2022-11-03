const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const mongoose = require("mongoose");

const { typeDefs } = require("./typedef.js");
const { resolvers } = require("./resolvers.js");

async function start( typeDefs, resolvers){

  const db = 'localhost:27017';
  const database = 'zettacamp';         

  // function connect to db
  const connectDB = async () => {
    try {
      await mongoose.connect(`mongodb://${db}/${database}`);
      console.log(`Connected to ${database}`)
    } catch (err) {
      console.log('Failed to connect to MongoDB', err);
    }
  }

  // connect to DB
  connectDB();
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    const app = express();
    server.applyMiddleware({ app });
    
    app.listen({ port: 4000 }, () =>
      console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
    );

}

// start 
start(typeDefs,resolvers)
