const mongoose = require("mongoose");

const songListModel = new mongoose.Schema({ 
    title: String,
    artist: String,
    genre: String,
    duration: String
}, {timestamps: true});

const songlist = mongoose.model('songlist', songModel);
module.exports = songlist;