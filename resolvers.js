const modelBook = require("./models/model.js");
const mongoose = require("mongoose");

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
      getAllBooks: async () => {
        let result = await modelBook.find({});
        return result;
      },
      getBooksById: async (parent, {id} ) => {
        let result = await modelBook.find({_id:id});
        return result;
      },
      getBooksByTitle: async (parent, {title}) => {
        let result = await modelBook.aggregate([
          {
            $match:{
              title:title
            }
          }
        ])
        return result;
      }
    }
  };

  module.exports = {resolvers};