const trancsactionsTypeDefs = `

type Transactions{
    id: ID
    user_id: User
    menu: [transactions_menu]
    order_status: String
    order_date: String
    status: status
    total_price: Int
}

type transactions_menu{
    id: ID
    recipe_id: Recipes
    amount: Int
    note: String
}

type Page_Transactions{
    data: [Transactions]
    page: Int
    maxPage: Int
    count: Int
}

enum enum_order_status{
    pending
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


type status_edited{
    status: String
}


type Query {
    GetOrder(page: Int, limit: Int): Transactions
    GetAllTransactions(
        page: Int, 
        limit: Int, 
        first_name_user: String,
        last_name_user: String, 
        recipe_name: String, 
        order_status: String, 
        order_date: String,
        sortDate: Boolean,
        sortTotalPrice: Boolean,
        sortMenu: Boolean,
        sortUserName: Boolean): Page_Transactions
    GetOneTransactions(id: ID): Transactions
}

type Mutation {
    CreateTransactions(input: Transactions_input): Transactions
    DeleteTransactions(id: ID): Transactions
    addCart(input: transactions_menu_input): Transactions
    deleteCart(id: ID): Transactions
    OrderNow(id: ID): Transactions
    IncrAmount(id: ID): status_edited
    DecrAmount(id: ID): status_edited
    EditNote(id: ID, newNote: String): status_edited
}


`

module.exports = { trancsactionsTypeDefs };