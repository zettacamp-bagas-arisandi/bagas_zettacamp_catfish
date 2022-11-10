const mongoose = require('mongoose')

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
   order_Status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'active'
   },
   order_date: {
    type: Date,
    default: new Date()
   },
   status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
   }

}, {timestamps: true});

const trancsactionsModel = mongoose.model('trancsactions', trancsactionsSchema);
module.exports = trancsactionsModel;

// db.trancsactions.insertOne(
//     {
//         user_id: ObjectId("636a5aeaeef26b2208891104"),
//         menu: [{
//             recipe_id: ObjectId("636b57a59edb8d4020325e1a"),
//             amount: 1,
//             note: 'Good Menus'
//         }],
//         order_status: 'success',
//         order_date: new Date(),
//         status: 'active',
//     }
// )