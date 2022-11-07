const modelSong = require("./models/song.js");
const modelSonglist = require("./models/songlist.js");
const modelUser = require("./models/user.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

let activeUser = {}

////Query////
async function getAllSonglist(parent, {skip = 0, limit = 3, page = 1 }, context){

    skip = (page-1)*limit;
    let result =  await modelSonglist.aggregate([
        {
            $skip: skip
        },{
            $limit: limit
        }
    ]);

    result = result.map((el) => {
        el.count = el.list.length;
        return el
    })

       
  const token = context.req.headers.authorization;
  const tokenCheck = jwt.decode(token);
  const getUser = tokenCheck.username;
  const getPass = tokenCheck.password;
  const getSecret = tokenCheck.secret;
  
  //console.log(tokenCheck)
  let playlist_count = await modelSonglist.count();
  let maxPage = Math.ceil(playlist_count/limit);

  if(getUser == activeUser.username && getPass == activeUser.password){
    
      jwt.verify(token, getSecret, (err) => {
       
      if (err){
        throw new GraphQLError(err)
      }
    
      })
  }else{
    throw new GraphQLError("Cek kembali username dan password anda");
  }

  result = {
    data: result,
    playlist_count: playlist_count ,
    page: `${page} / ${maxPage}`
   }
return result

    
}

async function getSongBy(parent, {id, title, artist, genre, skip = 0, limit = 3, page = 1 }, context){
    let query = { $and: []};
    let queryAgg = [];

    if (id){
        query.$and.push({
            _id:mongoose.Types.ObjectId(id)
          })
    }

    if (title){
        query.$and.push({
            title:title
          })
    }

    if (artist){
        query.$and.push({
            artist:artist
          })
    }

    if (genre){
        query.$and.push({
            genre:genre
          })
    }

    if (query.$and.length > 0){
        queryAgg.unshift(
          {
            $match: query
          }
        )
      }
    let result = await modelSong.aggregate(queryAgg);
    result.map((element) => { 
        element.id = mongoose.Types.ObjectId(element._id)
        return element
    })


    const token = context.req.headers.authorization;
    const tokenCheck = jwt.decode(token);
    const getUser = tokenCheck.username;
    const getPass = tokenCheck.password;
    const getSecret = tokenCheck.secret;
    
    //console.log(tokenCheck)
    let playlist_count = await modelSonglist.count();
    let maxPage = Math.ceil(playlist_count/limit);
  
    if(getUser == activeUser.username && getPass == activeUser.password){
      
        jwt.verify(token, getSecret, (err) => {
         
        if (err){
          throw new GraphQLError(err)
        }
      
        })
    }else{
      throw new GraphQLError("Cek kembali username dan password anda");
    }
  

    return result
}

async function getUser(parent){
    let result = await modelUser.find({});
    return result
}

////Loader////
async function getSongLoader (parent, args, context){
  if (parent._id){
   let cek = await context.songloader.load(parent._id)
   //console.log(cek)
   return cek
  }
}

////Mutation////

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
      const savePlaylist = new modelSonglist ({
        name: title,
        list: getIds,
        total_duration: `${stsMenit} menit, ${stsDetik} detik`,
        total_duration_detik: totalDetikNew,
        })
      savePlaylist.save(); 
      console.log( {Total: `${stsMenit} menit, ${stsDetik} detik`, randomList:newPlaylist})
      return savePlaylist;
  }

async function addRandomPlaylistDuration(parent, {duration, title}, context){

    let result;

    const token = context.req.headers.authorization;
    const tokenCheck = jwt.decode(token);
    const getUser = tokenCheck.username;
    const getPass = tokenCheck.password;
    const getSecret = tokenCheck.secret;
    
    if (title && duration){
      
        if(getUser == activeUser.username && getPass == activeUser.password){
            jwt.verify(token, getSecret, (err) => {
            
            if (err){
              throw new GraphQLError(err)
            }
            result = generatorSonglist(duration,title);
            })
        }else{
          throw new GraphQLError("Cek kembali username dan password anda");
        }
      }else{
        throw new GraphQLError(`Title: ${title} atau duration: ${duration}`);
      }
  

      return result
   
}

async function deleteSonglist(parent, {id}, context){

    let result;

    const token = context.req.headers.authorization;
    const tokenCheck = jwt.decode(token);
    const getUser = tokenCheck.username;
    const getPass = tokenCheck.password;
    const getSecret = tokenCheck.secret;
    
    if (id){
      
        if(getUser == activeUser.username && getPass == activeUser.password){
            jwt.verify(token, getSecret, (err) => {
            
            if (err){
              throw new GraphQLError(err)
            }
            
            })
        }else{
          throw new GraphQLError("Cek kembali username dan password anda");
        }
      }else{
        throw new GraphQLError(`Id: ${id} tidak ada`);
      }
  
      result = await modelSonglist.findByIdAndDelete(id)
      return result
   
}

async function updateSongPlaylist(parent, {id, song_id}, context){

    let result;

    const token = context.req.headers.authorization;
    const tokenCheck = jwt.decode(token);
    const getUser = tokenCheck.username;
    const getPass = tokenCheck.password;
    const getSecret = tokenCheck.secret;
    
    if (id && song_id){
      
        if(getUser == activeUser.username && getPass == activeUser.password){
            jwt.verify(token, getSecret, (err) => {
            
            if (err){
              throw new GraphQLError(err)
            }
            
            })
        }else{
          throw new GraphQLError("Cek kembali username dan password anda");
        }
      }else{
        throw new GraphQLError(`Id: ${id} dan song_id: ${song_id}`);
      }

     
    result = await modelSonglist.findById(id)
    await result.updateOne(
        {
        $push: { list: mongoose.Types.ObjectId(song_id) }
        }
    )
    return result
   
}

async function register(parent, {username, password, active, role}){
    if(username && password){
    const newUser = new modelUser({
        username: username,
        password: password,
        active: active,
        role: role
    })
    newUser.save()
    return newUser
    }else{
        throw new GraphQLError('Username dan Password wajib');
    }
}



////Login////

function generateAccessToken(payload) {
  return jwt.sign(payload, 'zetta', { expiresIn: '1h' });
}

async function login(parent, {username, password, secret}, context) {

  let userCheck = await modelUser.find({username: username});
  let status;
  activeUser = userCheck[0];
 
  if (userCheck.length < 1){
    return {status : `${username} tidak ditemukan`};
  }

  if (activeUser.username == username && activeUser.password == password ){
    const token =  generateAccessToken({ username: username, password: password, secret: secret });
    //console.log(activeUser)
    return {status: token}
  }else{
    return {status: 'Cek kembali password anda'}
  }
}

async function auth(parent, {token}, context){
  let status;
  const tokenCheck = jwt.decode(context.req.headers.authorization)
  const getUser = tokenCheck.username;
  const getPass = tokenCheck.password;
  const getSecret = tokenCheck.secret;
  
  //console.log(tokenCheck)


  if(getUser == activeUser.username && getPass == activeUser.password){
    
      jwt.verify(token, getSecret, (err) => {
       
      if (err){
        console.log(err)
        return status = err;
      }
      activeUser.active = true;
      status = "Behasil Login";
    //   return resolve()
      })
  }else{
      status = "Cek kembali username dan password anda";
  }
  return {status}
}



// Provide resolver functions for your schema fields
let resolvers = {
    Query: {
      login,
      auth, 
      getAllSonglist:auth,
      getSongBy,
      getUser
    },

    Mutation: {
        addRandomPlaylistDuration,
        deleteSonglist,
        updateSongPlaylist,
        register
    }
    ,

    Song_list: {
        song_ids: getSongLoader
    }
  };


  module.exports = {resolvers};
  