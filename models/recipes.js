const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({ 
    recipe_name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3 
    },
    ingredients: [{
        _id: false,
        ingredient_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'ingredients'
        },
        stock_used: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    status: {
        type : String,
        enum: ['active', 'deleted', 'unpublish'],
        default: 'unpublish'
    },
    description: {
        type: String,
        default: "Enak Banget YGY"
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const recipeModel = mongoose.model('recipes', recipeSchema);
module.exports = recipeModel;