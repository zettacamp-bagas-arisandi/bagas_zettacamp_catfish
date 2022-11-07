// import dataloader
const DataLoader = require('dataloader');
const modelSong = require('./models/song.js');


// import model
const loadSong = async function(checkId){
    let songList = await modelSong.find({
        _id: {
            $in: checkId
        }
    })

    let songMap = {};

    songList.forEach((n) => {
        songMap[n._id] = n
    })
    console.log(songList)
    return checkId.map(id => songMap[id])
}

const songLoader = new DataLoader(loadSong);
module.exports = songLoader;