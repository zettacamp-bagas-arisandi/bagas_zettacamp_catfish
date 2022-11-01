const mongoose = require("mongoose");

const songListModel = new mongoose.Schema({ 
    name: String,
    list: [{
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'songs' 
    }],
    total_duration: String,
    total_duration_detik: Number,
}, {timestamps: true});

const songlist = mongoose.model('songlists', songListModel);
module.exports = songlist;