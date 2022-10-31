const modelBook = require('./models/song.js')
function filterFind(req,res){
    let { id, title, author } = req.body;
    let cek = null;

    if (id != null){
        modelBook.findById(id, (err, docs) => {
            if (err){
                cek = err;
            }else{
                cek = docs;
            }
            res.send(cek);
        });
    }else if( title != null){
        modelBook.find({title:title}, (err, docs) => {
            if (err){
                cek = err;
            }else{
                cek = docs;
                if (cek == ''){
                    cek = `${title} tidak ada`
                }
            }
            res.send(cek)
        });
    }else if( author != null){
        modelBook.find({author:author}, (err, docs) => {
            if (err){
                cek = err;
            }else{
                cek = docs;
                if (cek == ''){
                    cek = `${author} tidak ada`
                }
            }
            res.send(cek)
        });
    }else{
        modelBook.find({}, (err, docs) => {
            if (err){
                cek = err;
            }else{
                cek = docs;
            }
            res.send(cek)
        });
    };
}

module.exports = filterFind ;