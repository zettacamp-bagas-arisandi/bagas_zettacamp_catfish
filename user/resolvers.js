const modelUser = require("../models/user");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { ApolloError } = require('apollo-server');

/////////////// QUERY USER ///////////////
async function GetAllUser(parent, {email, first_name, last_name, page = 1, limit = 5}){
    /// kondisikan skip dan count
    let count = await modelUser.count();
    skip = (page-1)*limit;

    /// temp var for query
    let query = {$and:[]};
    let queryAgg = [
        {
            $skip: skip
        },{
            $limit: limit
        }
    ];

    /// Kondisi untuk parameter, jika ada akan di push ke query $and
    if(email){
        query.$and.push({
            email:email
        });
    }else if(first_name){
        first_name = new RegExp(first_name, 'i');
        query.$and.push({
            first_name:first_name
        });
    }else if(last_name){
        last_name = new RegExp(last_name, 'i');
        query.$and.push({
            last_name:last_name
        });
    }else{
        queryAgg.push = [{
            $project: {
                __v: 0
            }
           }]
    };


    /// Kondisi jika semua parameter terisi, akan melakukan pipeline match
    if (query.$and.length > 0){
        queryAgg.push(
            {
                $match: query
            }
        )

        /// Update count jika termatch tanpa melibatkan skip dan limit
        if(result.length < count){
        let countMatch = await modelUser.aggregate([{
            $match: query
        }])
        count = countMatch.length;
    }
    }

    /// Panggil pipeline yang ada
    let result = await modelUser.aggregate(queryAgg);


    /// Pagination Things
    let pages = `${page} / ${Math.ceil(count/limit)}`

    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })

    /// return sesuai typdef
    result = {
        page: pages,
        count: count,
        data: result,
    }

    return result;

}

async function GetOneUser(parent, {id, email}){
    let result;
    /// Kondisi untuk parameter, jika ada akan find berdasarkan parameter
    if(id){
        result = await modelUser.find({_id: mongoose.Types.ObjectId(id)});
    }else if(email){
        result = await modelUser.find({email:email});
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    /// Jika result kosong
    if(result.length < 1 ){
        throw new GraphQLError('Data Tidak Ditemukan');
    }
    return result[0];
}

/////////////// MUTATION USER ///////////////
async function CreateUser(parent,{email, password, first_name, last_name, status}){
    try{
    const addUser = new modelUser({
        email: email, 
        password: password, 
        first_name: first_name, 
        last_name: last_name, 
        status: status
    });
    const added = await addUser.save();
    return addUser;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function UpdateUser(parent, {id, email, first_name, last_name, password}){
    let update;
    if(id){
        update = await modelUser.findByIdAndUpdate(id,{
            email: email, 
            password: password, 
            first_name: first_name, 
            last_name: last_name, 
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (update===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return update;
}

async function DeleteUser(parent, {id}){
    try{
    let deleted;
    if(id){
        deleted = await modelUser.findByIdAndUpdate(id,{
            status: 'deleted'
        },{new: true, runValidators: true});      
    }else{
        throw new GraphQLError('Minimal masukkan parameter');
    }

    if (deleted===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return deleted;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function Login(parent, {email, password}){
    if( email && password){
        let getUser = await modelUser.find({email: email});
        if(getUser.length < 1){
            throw new GraphQLError(`${email} tidak ditemukan`);
        }

        if(password === getUser[0].password){
            let token = jwt.sign({ username: getUser[0].email, password: getUser[0].password }, 'zetta', { expiresIn: '1h' });
            return {token};
        }else{
            throw new GraphQLError(`Password salah`);
        }
    }else{
        throw new GraphQLError('Masukkan parameter email dan password');
    }
}


const userResolvers = {
    Query: {
        GetAllUser,
        GetOneUser,
    },
    Mutation: {
        CreateUser,
        UpdateUser,
        DeleteUser,
        Login,
    }
  }

module.exports = { userResolvers }