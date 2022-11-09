const recipesTypeDefs = `

type Recipes{
    id: ID
    recipe_name: String
    ingredients: [ingredient_id]
    status: status
}

type ingredient_id{
    ids: Ingredients
    stock_used: Int
}

type Page_recipes{
    data_recipes: [Recipes]
    page: String
    count: Int
}


input ingredient_id_input{
    ingredient_id: ID
    stock_used: Int
}


type Query {
    GetAllRecipes(recipe_name: String): Page_recipes
    GetOneRecipes(id: ID): Recipes
}

type Mutation {
    CreateRecipes(recipe_name: String, input: [ingredient_id_input], status: String): Recipes
    UpdateIngredients(id: ID, name: String, stock: Int): Ingredients
    DeleteIngredients(id: ID): Ingredients
}


`

module.exports = { recipesTypeDefs };