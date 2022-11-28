const ingrTypeDefs = `

type Ingredients{
    id: ID
    name: String
    stock: Int
    status: status
}

type Page_Ingredients{
    data: [Ingredients]
    page: Int
    maxPage: Int
    count: Int
}

type Query {
    GetAllIngredients(name: String, stock: Int, status: String, page: Int, limit: Int): Page_Ingredients
    GetOneIngredients(id:ID): Ingredients
}

type Mutation {
    CreateIngredients(name: String, stock: Int): Ingredients
    UpdateIngredients(id: ID, name: String, stock: Int): Ingredients
    DeleteIngredients(id: ID): Ingredients
}

`

module.exports = { ingrTypeDefs };