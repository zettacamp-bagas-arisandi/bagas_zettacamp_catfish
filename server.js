const express = require('express');
const file = require('./script.js');
// console.log(list.byGenre(list.list, 'EDM'))
const jwt = require("jsonwebtoken");

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const app = express()
const port = 4000;

app.get('/list', (req,res) =>{
    res.send(file.list);
});

app.post('/token', urlencodedParser, (req,res) =>{
    const user = req.body.username;
    const pass = req.body.password;
    const token = generateAccessToken({ username: user, password: pass });
    res.send({Token: token});
});


app.post('/', authenticateToken, (req,res,next) => {
    res.send('Berhasil Login!');
});

app.post('/bygenre', authenticateToken, urlencodedParser, (req,res) => {
    const genre = req.body.genre;
    const setGenre = new Set();

    for(const [idx, val] of file.list.entries() ){
        setGenre.add(file.list[idx].genre)
    }

    if (setGenre.has(genre)){
        const result = file.byGenre(file.list, genre);
        res.send(result);
    }else{
        res.send(`${genre} tidak ada`)
    }
});


app.post('/byartist', authenticateToken, urlencodedParser, (req,res) => {
    const artist = req.body.artist;
    const setArtist = new Set();

    for(const [idx, val] of file.list.entries() ){
        setArtist.add(file.list[idx].artist)
    }
    if (setArtist.has(artist)){
        const result = file.byArtist(file.list, artist);
        res.send(result);
    }else{
        res.send(`${artist} tidak ada`)
    }
});

app.post('/randomlist', authenticateToken, urlencodedParser, (req,res) => {
    const duration = req.body.duration;
    const result = file.byDuration(file.list, duration);
    res.send(result);
})

app.use('*', (req,res) => {
    res.send('Halaman tidak ditemukan')
})

app.listen(port);
console.log(`Server running at port:${port}`);


// JWT
function generateAccessToken(payload) {
    return jwt.sign(payload, 'zetta', { expiresIn: '1h' });
  }
function authenticateToken(req, res, next) {
  
  //Get the request header that was sent
  const auth = req.headers['authorization'];
  /*
  auth = "Bearer <token>"
  so get the token by split and at index 1
  */
  const token = auth.split(' ')[1];

  // if there isn't any token, send unauthorised status
  if (token == null) return res.sendStatus(401) ;

  //verify the token with the secret key
  jwt.verify(token, 'zetta', (err, user) => {

    //if user is not in the database
    if (err) return res.sendStatus(403);
    //else access is granted
    return next();
  })
}
