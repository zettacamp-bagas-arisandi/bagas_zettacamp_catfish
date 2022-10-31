// require things
const express = require("express");
const mongoose = require("mongoose");
const modelSong = require("./models/song.js");
//const modelBookShelf = require('./models/bookshelf.js');
const filterFind = require("./function.js");

// body parser
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true })

// server
const app = express();
const port = 4000;

// Databases
const db = 'localhost:27017';
const database = 'zettacamp';         

// function connect to db
const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb://${db}/${database}`)
    console.log(`Connected to ${database}`)
  } catch (err) {
    console.log('Failed to connect to MongoDB', err)
  }
}

// connect to DB
connectDB();

// start server
app.listen(port);
console.log(`Server running at port:${port}`);

// async function SongsGenerator(){
//     let titleEn = 
//         [
//             'Cool Off Moves',
//             'Slump Summertime',
//             'Calm Options',
//             'Black Flies',
//             'Forget About Your Influence',
//             '100 Years',
//             'A Time Of Gem',
//             'Hymn Of Conversation',
//             'Private Driving',
//             'The Teenager'
//         ];

//     let artistFEn = ['Boy', 'Dona', 'Luke', 'Bruno', 'The', 'Asking', 'Aria', 'Michael'];
//     let artistLEn = ['Swift', 'Sarasvati', 'Gold', 'Jonas', 'Alexandria', 'Reeves', 'Pichu']

//     let genre = ['EDM', 'Pop', 'Rock'];
//     let duration = ['3:00','3:30','4:00','4:30','5:00','5:30'];

//     for (let [id, val] of titleEn.entries()){
//         let result = await new modelSong({
//             title: `${val}`,
//             artist: `${artistFEn[Math.floor(Math.random() * artistFEn.length)]} ${artistLEn[Math.floor(Math.random() * artistLEn.length)]}`,
//             genre: `${genre[Math.floor(Math.random() * genre.length)]}`,
//             duration: `${duration[Math.floor(Math.random() * duration.length)]}`
//         })
//     console.log(result)
//     result.save()
//     }

    
// }

// SongsGenerator()

/////////////////////////////////////////////////////////////////////////////////////////
