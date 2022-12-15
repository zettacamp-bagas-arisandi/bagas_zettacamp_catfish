const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({ 
    recipe_name: {
        type: String,
        required: true,
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
    },
    is_special_offers: {
        price_discount: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    category: {
        type : String,
        default: "appetizer"
    },
    sold: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const recipeModel = mongoose.model('recipes', recipeSchema);
module.exports = recipeModel;