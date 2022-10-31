const mongoose = require("mongoose");

const songModel = new mongoose.Schema({ 
    title: String,
    author: String,
    date_published: Date,
    price: Number,
    createdAt: Date,
    updateAt: Date
}, {timestamps: true});

const songs = mongoose.model('songs', songModel);
module.exports = songs;