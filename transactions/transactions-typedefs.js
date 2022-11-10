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

input allTransaction_input{
   last_name_user: String
   recipe_name: String
   order_status: String
   order_date: String
}



type Query {
    GetAllTransactions(filter: allTransaction_input): Page_Transactions
    GetOneRecipes(id: ID): Recipes
}

type Mutation {
    CreateRecipes(recipe_name: String, input: [ingredient_id_input], status: String): Recipes
    UpdateRecipes(id: ID, recipe_name: String, input: [ingredient_id_input]): Recipes
    DeleteRecipes(id: ID): Recipes
}


`

module.exports = { trancsactionsTypeDefs };