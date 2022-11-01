// require things
const express = require("express");
const mongoose = require("mongoose");
const modelSong = require("./models/song.js");
const modelSongList = require('./models/songlist.js');

// body parser
const bodyParser = require('body-parser');
const songlist = require("./models/songlist.js");
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

/////////////////// Songs EP ////////////////////

app.get('/songs', urlencodedParser, async (req, res) => {
  let query = {$and: []};
  let {id, title, artist, genre, duration, skip = 0, limit = 2, page = 1} = req.body;

  limit = parseInt(limit);
  page = parseInt(page);
  
  let data = {};

  if (page != 0){
    skip = (page-1) * limit
  }else{
    page = 1
  }

  if(limit <= 0){
    limit = 2
  }
  

  let queryAgg = [
    {
      $facet: {
        "result": [
          {
            $sort: {_id: -1}
          },{
            $addFields: {
              count: {$sum: 1}
            }
          },{
            $skip: skip
          },{
            $limit: limit
          },{
          $project: {
            createdAt: 0, updatedAt: 0, __v: 0, _id:0
            }
          }
        ]
      },
    },{
      $addFields: {
        page: `${page} / ${Math.ceil(await modelSong.aggregate()/limit)}`
      }
    } 
  ];

  if(id){
    query.$and.push({
      _id:mongoose.Types.ObjectId(id)
    })
  } else if(artist){
    query.$and.push({
      artist:artist
    })
  }else if (genre){
    query.$and.push({
      genre:genre
    })
  }else if(duration){
    query.$and.push({
      duration:duration
    })
  }else if(title){
    query.$and.push({
      title:title
    })
  }

  if (query.$and.length > 0){
    queryAgg.unshift(
      {
        $match: query
      }
    )
  }

  data = await modelSong.aggregate(queryAgg);
  
  res.send(data);
});


app.get('/songs', urlencodedParser, async (req, res) => {
  let query = {$and: []};
  let {id, title, artist, genre, duration, skip = 0, limit = 2, page = 1} = req.body;

  limit = parseInt(limit);
  page = parseInt(page);
  
  let data = {};

  if (page != 0){
    skip = (page-1) * limit
  }else{
    page = 1
  }

  if(limit <= 0){
    limit = 2
  }
  
  //let pages = `${page} / ${Math.ceil(await modelSong.count()/limit)}`;

  let queryAgg = [
    {
      $facet: {
        "result": [
          {
            $sort: {_id: -1}
          },{
            $addFields: {
              count: {$sum: 1}
            }
          },{
            $skip: skip
          },{
            $limit: limit
          },{
          $project: {
            createdAt: 0, updatedAt: 0, __v: 0, _id:0
            }
          }
        ]
      },
    },{
      $addFields: {
        page: `${page} / ${Math.ceil(await modelSong.aggregate()/limit)}`
      }
    } 
  ];

  if(id){
    query.$and.push({
      _id:mongoose.Types.ObjectId(id)
    })
  } else if(artist){
    query.$and.push({
      artist:artist
    })
  }else if (genre){
    query.$and.push({
      genre:genre
    })
  }else if(duration){
    query.$and.push({
      duration:duration
    })
  }else if(title){
    query.$and.push({
      title:title
    })
  }

  if (query.$and.length > 0){
    queryAgg.unshift(
      {
        $match: query
      }
    )
    
    //console.log(pages)
  }
  console.log(query.$and.length)

  data = await modelSong.aggregate(queryAgg);
  
  // if (data.length){
  //   data = {
  //     page: pages,
  //     count: limit,
  //     data
  //   }
  // if (!data.length){
  //   data = {
  //     page: `${page} tidak ada`
  //   }
  // }

  res.send(data);
});

app.post('/songs', urlencodedParser, async (req,res) => {
  let {title, artist, genre, duration,index} = req.body;
  let addSong = {}
  let data = []
  
  if(title && artist && genre && duration){
      addSong = new modelSong({
        index: index,
        title: title,
        artist: artist,
        genre: genre,
        duration: duration
      })
    
      data = {
        status: `Data sukses ditambahkan`,
        data: addSong
      }
      addSong.save();
  }else{
    data = {
      status: `Data gagal ditambahkan`,
      detail: {
        title: `${title}`,
        artist: `${artist}`,
        genre: `${genre}`,
        duration: `${duration}`
      }
    }
  }
  res.send(data);
});

app.put('/songs', urlencodedParser, async(req,res) => {
  let {id, title, artist, genre, duration, index} = req.body;
  let data;

  if (id){
    data = await modelSong.findByIdAndUpdate(id,
      {
       index: index,
       title: title,
       artist: artist,
       genre: genre,
       duration:duration 
      },{new:true}
      );
    }
    
  res.send(data)
});

app.delete('/songs', urlencodedParser, async(req,res) => {
  let {id} = req.body;
  let data;
  if(id){
    data = {
      status: `${id} berhasil dihapus`,
      data: await modelSong.findByIdAndDelete(id)
    }
  }else{
    data = {
      status: `${id} tidak ada`,
      data
    }
  }
  res.send(data);
})

app.get('/songs-genre', urlencodedParser, async (req, res) => {
  let query = {$and: []};
  let {id, title, artist, genre, duration, skip = 0, limit = 2, page = 1} = req.body;

  limit = parseInt(limit);
  page = parseInt(page);
  
  let data = {};

  if (page != 0){
    skip = (page-1) * limit
  }else{
    page = 1
  }

  if(limit <= 0){
    limit = 2
  }
  
  let pages = `${page} / ${Math.ceil(await modelSong.count()/limit)}`;

  if (page>pages){
    page = pages
  }

  let queryAgg = [
    {
      $group: {
      _id: "$genre",
      count: { $sum: 1 },
      list: { $push: { title: "$title", artist: "$artist"}}
    }
    } 
  ];

  if(id){
    query.$and.push({
      _id:mongoose.Types.ObjectId(id)
    })
  } else if(artist){
    query.$and.push({
      artist:artist
    })
  }else if (genre){
    query.$and.push({
      genre:genre
    })
  }else if(duration){
    query.$and.push({
      duration:duration
    })
  }else if(title){
    query.$and.push({
      title:title
    })
  }

  if (query.$and.length > 0){
    queryAgg.unshift(
      {
        $group: {
          _id: "$artist",
          list: { $push: { title: "$title"}}
        }
      }
    )
  }
  console.log(query.$and.length)

  data = await modelSong.aggregate(queryAgg);

  res.send(data);
});

///////////////////// Songlist EP /////////////////

app.get('/songslist', urlencodedParser, async(req,res) => {
  let query = {$and: []};
  let {id, title, artist, genre, duration, limit = 2, page = 1} = req.body;
  let skip = 0;
  limit = parseInt(limit);
  page = parseInt(page)
  let data = {};

  if (page != 0){
    skip = (page-1) * limit
  }else{
    page = 1
  }

  if(limit <= 0){
    limit = 2
  }
  
  let pages = `${page} / ${Math.ceil(await modelSongList.count()/limit)}`;

  let queryAgg = [
    {
      $facet: {
        "result": [
          {
            $sort: {_id: -1}
          },{
            $skip: skip
          },{
            $limit: limit
          },{
          $project: {
            createdAt: 0, updatedAt: 0, __v: 0
            }
          }
        ]
      }
    },{
      $addFields: {
        page: pages
      }
    }
  ];

  if(id){
    query.$and.push({
      _id:mongoose.Types.ObjectId(id)
    })
  } else if(artist){
    query.$and.push({
      artist:artist
    })
  }else if (genre){
    query.$and.push({
      genre:genre
    })
  }else if(duration){
    query.$and.push({
      duration:duration
    })
  }else if(title){
    query.$and.push({
      title:title
    })
  }

  if (query.$and.length > 0){
    queryAgg.unshift({
      $match: query
    },
    {
      $facet: {
        "find_result":[
          {
            $lookup:{
              from: 'songs',
              localField: 'list',
              foreignField: '_id',
              as: 'Songs'
            }
          },
          {
            $skip: skip*limit
          },
          {
            $limit: limit
          },
          {
            $project: {
              list: 0
            }
          }
        ]
      }
    }
    )
  }
  console.log(query.$and.length)

  data = await modelSongList.aggregate(queryAgg);

  // if (data.length){
  //   data = {
  //     page: pages,
  //     count: limit,
  //     data
  //   }
  // }
  // if (!data.length){
  //   data = {
  //     page: `${page} tidak ada`
  //   }
  // }

  res.send(data);
})

app.post('/songslist/add-byduration', urlencodedParser, async(req,res) => {
  let {title,duration} = req.body;
  let data;
  if (title && duration){
    data = await generatorSonglist(duration,title);
  }else{
    data = `Title: ${title} atau duration: ${duration}`
  }
  res.send(data)
})

app.delete('/songslist/add-byduration', urlencodedParser, async(req,res) => {
  let {id, title} = req.body;
  let data;
  
  if(id){
    data = await modelSongList.findByIdAndDelete(id)
  }else if(title){
    data = await modelSongList.deleteOne({name:title})
  }else{
    data = {
      status: `Data tidak ditemukan`,
      data: `id: ${id} atau title: ${title} tidak ada`
    }
  }

  if (data){
    data = {
    status: `Data dihapus`,
    data
  }
  }else{
    data = {
      status: `Data tidak ditemukan`,
      data: `id: ${id} atau title: ${title} tidak ada`
    }
}
  
 console.log(data)

  res.send(data);
})

app.put('/songslist/add-list',urlencodedParser, async(req,res) => {
  let {id, add_id} = req.body;
  let data;
  console.log(mongoose.Types.ObjectId(add_id))
  if(id){
    const playlist = await modelSongList.findById(id)
    await playlist.updateOne(
      {
      $push: { list: mongoose.Types.ObjectId(add_id) }
      }
    )
  }
  res.send(data)
})

async function generatorSonglist(duration, title){
  let list = [];
  let getData;
  getData = await modelSong.find({});
  song = getData.sort( () => Math.random() - 0.5);


  let dur = duration * 60;
    // untuk Split by duration
    let arrDur = [];
    // untuk playlist baru
    let newPlaylist = [];
    // hitung durasi dari semua song
    let totalDetik = 0;
    // hotung durasi dari semua song di playlist baru
    let totalDetikNew = 0;

    // status
    let stsMenit = 0;
    let stsDetik = 0;


    // looping sebanyak jumlah array dalam list
    for (const item of song){
        arrDur = item.duration.split(':');
        let detik = ( parseInt(arrDur[0]*60) + parseInt(arrDur[1]) );
        totalDetik += detik;
        
        // pushing ke array playlist baru 
        if (totalDetik < dur){
            totalDetikNew += detik;
            newPlaylist.push(item);
        }else{
            break;
        }
    }

    // looping sebanyak total detik
    for (let i = 0; i < totalDetikNew; i++){
        stsDetik++;
        if (stsDetik > 59){
            stsMenit++;
            stsDetik = 0;
        }
    }

    const getIds = [];
    for(const n of newPlaylist){
      getIds.push(n._id)
    }

    console.log(getIds)
    const savePlaylist = new modelSongList ({
      name: title,
      list: getIds,
      total_duration: `${stsMenit} menit, ${stsDetik} detik`,
      total_duration_detik: totalDetikNew,
      })
    savePlaylist.save(); 
    console.log( {Total: `${stsMenit} menit, ${stsDetik} detik`, randomList:newPlaylist})
    return savePlaylist;
}



// async function generatorSonglist(duration){
//   let list = [];
//   let getData;
//   getData = await modelSong.find({});
//   song = getData.sort( () => Math.random() - 0.5);


//   let dur = duration * 60;
//     // untuk Split by duration
//     let arrDur = [];
//     // untuk playlist baru
//     let newPlaylist = [];
//     // hitung durasi dari semua song
//     let totalDetik = 0;
//     // hotung durasi dari semua song di playlist baru
//     let totalDetikNew = 0;

//     // status
//     let stsMenit = 0;
//     let stsDetik = 0;


//     // looping sebanyak jumlah array dalam list
//     for (const item of song){
//         arrDur = item.duration.split(':');
//         let detik = ( parseInt(arrDur[0]*60) + parseInt(arrDur[1]) );
//         totalDetik += detik;
        
//         // pushing ke array playlist baru 
//         if (totalDetik < dur){
//             totalDetikNew += detik;
//             newPlaylist.push(item);
//         }else{
//             break;
//         }
//     }

//     // looping sebanyak total detik
//     for (let i = 0; i < totalDetikNew; i++){
//         stsDetik++;
//         if (stsDetik > 59){
//             stsMenit++;
//             stsDetik = 0;
//         }
//     }

//     const getIds = [];
//     for(const n of newPlaylist){
//       getIds.push(n._id)
//     }

//     console.log(getIds)
//     const savePlaylist = new modelSongList ({
//       name: 'Random Song Less than 60 Minutes',
//       list: getIds,
//       total_duration: `${stsMenit} menit, ${stsDetik} detik`,
//       total_duration_detik: totalDetikNew,
//       })
//     savePlaylist.save(); 

//     console.log( {Total: `${stsMenit} menit, ${stsDetik} detik`, randomList:newPlaylist})
// }
// generatorSonglist()

// async function generatorSonglist(){
//   let list = [];
//   let getData;
//   getData = await modelSong.find({});
//   song = getData.sort( () => Math.random() - 0.5);


//   let dur = 60 * 60;
//     // untuk Split by duration
//     let arrDur = [];
//     // untuk playlist baru
//     let newPlaylist = [];
//     // hitung durasi dari semua song
//     let totalDetik = 0;
//     // hotung durasi dari semua song di playlist baru
//     let totalDetikNew = 0;

//     // status
//     let stsMenit = 0;
//     let stsDetik = 0;


//     // looping sebanyak jumlah array dalam list
//     for (const item of song){
//         arrDur = item.duration.split(':');
//         let detik = ( parseInt(arrDur[0]*60) + parseInt(arrDur[1]) );
//         totalDetik += detik;
        
//         // pushing ke array playlist baru 
//         if (totalDetik < dur){
//             totalDetikNew += detik;
//             newPlaylist.push(item);
//         }else{
//             break;
//         }
//     }

//     // looping sebanyak total detik
//     for (let i = 0; i < totalDetikNew; i++){
//         stsDetik++;
//         if (stsDetik > 59){
//             stsMenit++;
//             stsDetik = 0;
//         }
//     }

//     const getIds = [];
//     for(const n of newPlaylist){
//       getIds.push(n._id)
//     }

//     console.log(getIds)
//     const savePlaylist = new modelSongList ({
//       name: 'Random Song Less than 60 Minutes',
//       list: getIds,
//       total_duration: `${stsMenit} menit, ${stsDetik} detik`,
//       })
//     savePlaylist.save(); 

//     console.log( {Total: `${stsMenit} menit, ${stsDetik} detik`, randomList:newPlaylist})
// }
// generatorSonglist()

// async function SongsGeneratorEN(){
//   let index = 1;
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
//             index : index,
//             title: `${val}`,
//             artist: `${artistFEn[Math.floor(Math.random() * artistFEn.length)]} ${artistLEn[Math.floor(Math.random() * artistLEn.length)]}`,
//             genre: `${genre[Math.floor(Math.random() * genre.length)]}`,
//             duration: `${duration[Math.floor(Math.random() * duration.length)]}`
//         })
//     console.log(result)
//     result.save()
//     index++
//     }

    
// }

// async function SongsGeneratorID(){
//   let index = 11;
//     let titleEn = 
//         [
//             'Seandainya',
//             'Biarlah',
//             'Dan',
//             'Kamu',
//             'Cerita Hari ini',
//             'Aku adalah Aku',
//             'Jakarta Story',
//             'Tempat Terindah',
//             'Dibalik Hari Esok',
//             'Sebuah Rahasia'
//         ];

//     let artistFEn = ['Budi', 'Jay', 'Mawar', 'Melati', 'Doni', 'Vino', 'Abrar', 'Band'];
//     let artistLEn = ['Pamungkas', 'Savitri', 'Ben', 'Ahmad', 'See', 'Lagi', 'Woi']

//     let genre = ['EDM', 'Pop', 'Rock'];
//     let duration = ['3:00','3:30','4:00','4:30','5:00','5:30'];

//     for (let [id, val] of titleEn.entries()){
//         let result = await new modelSong({
//           index: index,
//             title: `${val}`,
//             artist: `${artistFEn[Math.floor(Math.random() * artistFEn.length)]} ${artistLEn[Math.floor(Math.random() * artistLEn.length)]}`,
//             genre: `${genre[Math.floor(Math.random() * genre.length)]}`,
//             duration: `${duration[Math.floor(Math.random() * duration.length)]}`
//         })
//     console.log(result)
//     result.save()
//     index++
//     }

    
// }

// SongsGeneratorEN()
//SongsGeneratorID()

/////////////////////////////////////////////////////////////////////////////////////////
