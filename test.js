const janjiX = true;
const janji = new Promise ((resolve,reject) => {
    if(janjiX === true){
        resolve('Ok')
    } else {
        reject('Not OK')
    }
})

// try{
//     console.log('OKOK')
// }catch(err){
//     console.log(err)
// }
