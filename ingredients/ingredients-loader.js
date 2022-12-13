// import dataloader
const DataLoader = require('dataloader');
const ingrModel = require('./ingredients-model');


// import model
const loadIngr = async function(ingredients){
    let ingrList = await ingrModel.find({
        _id: {
            $in: ingredients
        }
    })

    let ingrMap = {};

    ingrList.forEach((n) => {
        ingrMap[n._id] = n
    })
    return ingredients.map(id => ingrMap[id])
}

const ingrLoader = new DataLoader(loadIngr);
module.exports = ingrLoader;