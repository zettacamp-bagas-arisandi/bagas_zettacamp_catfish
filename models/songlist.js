const mongoose = require("mongoose");

const songListModel = new mongoose.Schema({ 
    name: String,
    list: String,
    total_duration: String
}, {timestamps: true});

const songlist = mongoose.model('songlists', songListModel);
module.exports = songlist;