const modelUser = require("./user-model");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { ApolloError } = require('apollo-server');
const bcrypt = require('bcrypt');

/////////////// QUERY USER ///////////////
async function GetAllUser(parent, {email, first_name, last_name, page = 1, limit = 5}, context){
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
        email = new RegExp(email, 'i')
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
        let countMatch = await modelUser.aggregate([{
            $match: query
        }])
        count = countMatch.length;
    }

    /// Panggil pipeline yang ada
    let result = await modelUser.aggregate(queryAgg);


    /// Pagination Things
    let pages = page;
    let maxPages = Math.ceil(count/limit);

    /// Fixing id null
    result = result.map((el) => {
        el.id = mongoose.Types.ObjectId(el._id);
        return el;
    })
    /// return sesuai typdef
    result = {
        page: pages,
        maxPage: maxPages,
        count: count,
        data: result,
    }
    return result;
}

async function GetOneUser(parent, {id, email}){
    let result;
    /// Kondisi untuk parameter, jika ada akan find berdasarkan parameter
    if(id){
        result = await modelUser.findOne({_id: mongoose.Types.ObjectId(id)});
    }else if(email){
        email = new RegExp(email, 'i');
        result = await modelUser.findOne({email:email});
    }else{
        throw new GraphQLError('Masukkan ID atau Email yang ingin dicari');
    }

    /// Jika result kosong
    if(!result){
        throw new GraphQLError('Data Tidak Ditemukan');
    }
    return result;
}

/////////////// MUTATION USER ///////////////

async function CreateUser(parent,{email, password, first_name, last_name, role, question_answer}){
    try{
        let permission = [];

        const permissionAdmin = [
            {
                name: "homepage",
                view: true
            },{
                name: "login",
                view: true
            },{
                name: "menu",
                view: true
            },{
                name: "cart",
                view: true
            },{
                name: "about",
                view: true
            },{
                name: "stock_management",
                view: true
            },{
                name: "menu_management",
                view: true
            }
        ];

        const permissionUser = [{
            name: "homepage",
            view: true
        },{
            name: "login",
            view: true
        },{
            name: "menu",
            view: true
        },{
            name: "cart",
            view: true
        },{
            name: "about",
            view: true
        },{
            name: "stock_management",
            view: false
        },{
            name: "menu_management",
            view: false
        }];

        if(role === 'admin'){
            permission = permissionAdmin;
        }else{
            permission = permissionUser;
        }
    password = await bcrypt.hash(password, 5);
    const addUser = new modelUser({
        email: email, 
        password: password, 
        first_name: first_name, 
        last_name: last_name, 
        role: role,
        question_answer: question_answer,
        user_type: permission,
        balance: 500000
    });
    const added = await addUser.save();
    return addUser;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function UpdateUser(parent, { id, email, first_name, last_name, password},context){
    /// temp variabel
    let update;
    let check = await modelUser.findById(context.req.user_id);

    /// fix overwriting

    /// hash password
    if (password){
        password = await bcrypt.hash(password, 5);
    }else{
        password = check.password;
    }

    if (!email){
        email = check.email;
    }

    if(!first_name){
        first_name = check.first_name;
    }

    if(!last_name){
        last_name = check.last_name;
    }

    if(email || first_name || last_name || password){
        update = await modelUser.findByIdAndUpdate(context.req.user_id,{
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
        throw new GraphQLError('id user tidak terbaca');
    }

    if (deleted===null){
        throw new GraphQLError(`Data dengan id:${id} tidak ada`);
    }
  
    return deleted;
    }catch(err){
        throw new ApolloError(err)
    }
}

async function Login(parent, {email, password}, context){
    if( email && password){
        let getUser = await modelUser.findOne({email: email});
        if(!getUser){
            throw new GraphQLError(`${email} tidak ditemukan`);
        }
        const isValid = await bcrypt.compare(password, getUser.password);
        if(isValid){
            let token = jwt.sign({ 
                email: getUser.email, 
                password: getUser.password, 
                role: getUser.role, 
                user_id: getUser._id,
                first_name: getUser.first_name
            }, 'zetta', { expiresIn: '1d' });
            return {
                id: getUser._id,
                email: getUser.email,
                role: getUser.role,
                user_type: getUser.user_type,
                first_name: getUser.first_name,
                token: token,
                balance: getUser.balance
            };
        }else{
            throw new GraphQLError(`Password salah`);
        }
    }else{
        throw new GraphQLError('Masukkan parameter email dan password');
    }
}

async function ForgetPassword(parent, {email, answer, newPassword}){
   let find = await modelUser.findOne({email:email});
   if(!find){
       throw new GraphQLError('Email tidak ditemukan');
    }
    newPassword = await bcrypt.hash(newPassword, 5);
    if(answer === find.question_answer){
        let update = await modelUser.findByIdAndUpdate(find._id,{
            password: newPassword
        },{new: true, runValidators: true});      
        return {result: "Password berhasil dirubah!"}
   }else{
    throw new GraphQLError('Security answer salah!')
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
        ForgetPassword
    }
  }

module.exports = { userResolvers }