const express = require("express");
const path = require('path');
const book = require('./data.txt')

const app = express();
const port = 4000;

const userSet = 'bagas';
const passSet = 'admin123';

function authentication(req, res, next){
    let authheader = req.headers.authorization;
    //console.log(req.headers.authorization);

    if (!authheader){
        res.send("Tidak ada otentikasi..");
        res.end();
    } else {
        let auth = new Buffer.from(authheader.split(' ')[1],'base64').toString().split(':');
        let user = auth[0];
        let pass = auth[1];
        //console.log(auth)
        if (user == userSet && pass == passSet) {
 
            // If Authorized user
            console.log(`${userSet} berhasil terotentikasi..`);
            next();
        } else {
            res.send("Kamu tidak terotentikasi..");
            res.end();
        }
    }
}

// middleware
app.use(authentication);

app.get('/', (req,res) => {
    res.send(`Welcome admin ${userSet}!`);
});

app.get('/book', (req,res) => {
    res.sendFile('/data.txt' , { root : __dirname});
 });

app.get('*', (req,res) => {
    res.send("Path tidak ditemukan..");
 });


app.listen(port);
console.log(`Server running at port:${port}`);
