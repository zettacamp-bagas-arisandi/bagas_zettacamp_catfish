const userTypeDefs = `

type Page_User{
    data: [User]
    page: Int
    maxPage: Int
    count: Int
}

type User{
    id: ID
    email: String!
    password: String!
    first_name: String!
    last_name: String!
    status: status
    role: String
    user_type: [user_types]
}

type user_types{
    name: String
    view: Boolean
}

enum status{
    active
    deleted
    unpublish
}

type Token{
    id: ID
    email: String!
    role: String
    user_type: [user_types]
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
    CreateUser(email: String, password: String, first_name: String, last_name: String, role: String): User
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