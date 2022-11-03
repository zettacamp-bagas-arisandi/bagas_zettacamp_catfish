const { ApolloServer, gql } = require('apollo-server-express');


// Construct a schema, using GraphQL schema language
const typeDefs = gql`
type Book {
    id: ID!
    title: String
    author: String
    date_published: String
    price: Int
}

type Query {
    getAllBooks : [Book]
    getBooksById(id: ID): [Book]
    getBooksByTitle(title: String): [Book] 
}
`;

module.exports = { typeDefs } ;