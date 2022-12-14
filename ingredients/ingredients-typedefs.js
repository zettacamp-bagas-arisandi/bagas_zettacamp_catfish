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

type deleted{
    status: String
}

type Query {
    GetAllIngredients(name: String, stock: Int, status: String, page: Int, limit: Int
        ,sortName: Boolean, sortStock: Boolean): Page_Ingredients
    GetOneIngredients(id:ID): Ingredients
}

type Mutation {
    CreateIngredients(name: String, stock: Int): Ingredients
    UpdateIngredients(id: ID, name: String, stock: Int): Ingredients
    DeleteIngredients(id: ID): deleted
}

`

module.exports = { ingrTypeDefs };