const mongoose = require('mongoose');
const moment = require('moment');

const trancsactionsSchema = new mongoose.Schema({ 
   user_id: {
    type : mongoose.SchemaTypes.ObjectId,
    required: true,
    trim: true,
    ref: 'users'
   },
   menu: [{
    recipe_id: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        trim: true,
        ref: 'recipes'
    },
    amount: {
        type: Number,
        min: 0 
    },
    note: String
   }],
   order_status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'pending'
   },
   order_date: {
    type: String,
    default: moment(new Date()).locale('id').format('LL')
   },
   status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
   },
   total_price: {
    type: Number,
    default: 0
   }

}, {timestamps: true});

const trancsactionsModel = mongoose.model('trancsactions', trancsactionsSchema);
module.exports = trancsactionsModel;
