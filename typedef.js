const { ApolloServer, gql } = require('apollo-server-express');


// Construct a schema, using GraphQL schema language
const typeDefs = gql`
type User{
    id: Int
    username: String
    password: String
    role: String
}

type Book {
    id: ID
    title: String
    author: String
    date_published: String
    price: Int
    stock: Int
}

type Books {
    data_books: [Book]
    count: Int
    page: Int
    max_page: Int
}

type addedBooks {
   status: String
   data_books: Book
}

type deletedBooks{
    status: String
    data_books: Book
}

type updatedBooks{
    status: String
    data_books: Book
}

type buyBook{
    detail: Book
    tax: Int
    discount: Int
    price_tax: Int
    price_discount: Int
    price_total: Int
}

type date_BookShelf{
    date: String
    time: String
}

type BookShelf_bookIds{
    books_id: Book
}

type BookShelf{
    name: String
    books: [BookShelf_bookIds]
    date: [date_BookShelf]
}

type login{
    status: String
}

type Query {
    getAllBooks(page: Int, skip: Int, limit: Int): Books
    buyBooks(id: ID, title: String, discount: Int, tax: Int): buyBook
    getBooksBy(id: ID, title: String, author: String): Books
    getBookShelf: [BookShelf]
    login(username: String, password: String, secret: String): login
    auth(token: String): login
}

type Mutation {
    addBooks(title: String, author: String, price: Int, date_published: String ): addedBooks
    updateBooks(id: ID, title: String, author: String, price: Int, date_published: String ): updatedBooks
    deleteBooks(id: ID): deletedBooks
}
`;

module.exports = { typeDefs } ;