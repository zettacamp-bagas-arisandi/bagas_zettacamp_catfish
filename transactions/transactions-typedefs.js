const trancsactionsTypeDefs = `

type Transactions{
    id: ID
    user_id: User
    menu: [transactions_menu]
    order_status: enum_order_status
    order_date: String
    status: status
}

type transactions_menu{
    recipe_id: Recipes
    amount: Int
    note: String
}

type Page_Transactions{
    data: [Transactions]
    page: String
    count: Int
}

enum enum_order_status{
    success
    failed
}


input transactions_menu_input{
    recipe_id: ID
    amount: Int
    note: String
}

input Transactions_input{
    menu: [transactions_menu_input]
}

input allTransaction_input{
   last_name_user: String
   recipe_name: String
   order_status: String
   order_date: String
}


type Query {
    GetAllTransactions(filter: allTransaction_input, page: Int, limit: Int): Page_Transactions
    GetOneTransactions(id: ID): Transactions
}

type Mutation {
    CreateTransactions(input: Transactions_input): Transactions
    DeleteTransactions(id: ID): Transactions
}


`

module.exports = { trancsactionsTypeDefs };