// import dataloader
const DataLoader = require('dataloader');
const recipesModel = require('./recipes-model');


// import model
const loadRecipes = async function(recipe){
    let recipeList = await recipesModel.find({
        _id: {
            $in: recipe
        }
    })

    let recipeMap = {};

    recipeList.forEach((n) => {
        recipeMap[n._id] = n
    })
    return recipe.map(id => recipeMap[id])
}

const recipeLoader = new DataLoader(loadRecipes);
module.exports = recipeLoader;