// import dataloader
const DataLoader = require('dataloader');
const userModel = require('./user-model');


// import model
const loadUser = async function(user){
    let userList = await userModel.find({
        _id: {
            $in: user
        }
    })

    let userMap = {};

    userList.forEach((n) => {
        userMap[n._id] = n
    })
    return user.map(id => userMap[id])
}

const userLoader = new DataLoader(loadUser);
module.exports = userLoader;