const mongoose = require('mongoose')

const ingrSchema = new mongoose.Schema({ 
   name: {
    type : String,
    required: true,
    trim: true,
    unique: true
   },
   stock: {
    type: Number,
    min: 0,
    required: true,
    trim: true
   },
   status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
   }
}, {timestamps: true});

const ingrModel = mongoose.model('ingredients', ingrSchema);
module.exports = ingrModel;