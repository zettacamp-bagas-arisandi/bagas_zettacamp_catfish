const recipesTypeDefs = `

type Recipes{
    id: ID
    recipe_name: String
    ingredients: [ingredient_id]
    status: status
    description: String
    image: String
    price: Int
    remain_order: Int
}

type ingredient_id{
    ids: Ingredients
    stock_used: Int
}

type Page_recipes{
    data_recipes: [Recipes]
    page: Int
    maxPage: Int
    count: Int
}


input ingredient_id_input{
    ingredient_id: ID
    stock_used: Int
}


type Query {
    GetAllRecipes(recipe_name: String, page: Int, limit: Int): Page_recipes
    GetOneRecipes(id: ID): Recipes
}

type Mutation {
    CreateRecipes(recipe_name: String, input: [ingredient_id_input], description: String, price: Int, image: String, status: String): Recipes
    UpdateRecipes(id: ID, recipe_name: String, input: [ingredient_id_input], price: Int, image: String, desription: String, status: String): Recipes
    DeleteRecipes(id: ID): Recipes
    PublishRecipes(id: ID): Recipes
}


`

module.exports = { recipesTypeDefs };