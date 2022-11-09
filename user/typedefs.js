const userTypeDefs = `

type Page_User{
    data: [User]
    page: String
    count: Int
}

type User{
    id: ID!
    email: String!
    password: String!
    first_name: String!
    last_name: String!
    status: status
}

enum status{
    active
    deleted
}

type Token{
    token: String
}

type Query {
    GetOneUser(id: ID, email: String): User
    GetAllUser(
        email: String
        last_name: String
        first_name: String
        page: Int
        limit: Int): Page_User
  
}

type Mutation{
    CreateUser(email: String, password: String, first_name: String, last_name: String, status: status): User
    UpdateUser(id: ID, email: String, password: String, first_name: String, last_name: String): User
    DeleteUser(id: ID): User
    Login(email: String, password: String): Token
}

input GetAllUserInput{
    email: String
    last_name: String
    first_name: String
    page: Int
    limit: Int
}

`

module.exports = { userTypeDefs };