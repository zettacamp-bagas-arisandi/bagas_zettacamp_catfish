const mongoose = require("mongoose");

const songModel = new mongoose.Schema({ 
    title: String,
    artist: String,
    genre: String,
    duration: String
}, {timestamps: true});

const songs = mongoose.model('songs', songModel);
module.exports = songs;