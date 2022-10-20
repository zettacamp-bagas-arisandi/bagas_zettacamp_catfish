// Song list

let list = [
    {
        title: "Till It Hurts",
        artist: "Yellow Claw",
        genre: "EDM",
        duration: '05:30'
    },
    {
        title: "Both Of Us",
        artist: "Yellow Claw",
        genre: "EDM",
        duration: '05:10'
    },
    {
        title: "Lunatic",
        artist: "Weird Genius",
        genre: "EDM",
        duration: '04:30'
    },
    {
        title: "LATHI",
        artist: "Weird Genius",
        genre: "EDM",
        duration: '03:10'
    },
    {
        title: "Sweet Scar",
        artist: "Weird Genius",
        genre: "EDM",
        duration: '05:25'
    },
    {
        title: "Kingslayer",
        artist: "BMTH",
        genre: "Rock",
        duration: '06:30'
    },
    {
        title: "ABC feat. Sophia",
        artist: "Polyphia",
        genre: "Rock",
        duration: '03:55'
    },
    {
        title: "Euphoria",
        artist: "Polyphia",
        genre: "Rock",
        duration: '05:30'
    },
    {
        title: "Beraksi",
        artist: "Kotak",
        genre: "Rock",
        duration: '05:20'
    },
    {
        title: "Terbang",
        artist: "Kotak",
        genre: "Rock",
        duration: '04:30'
    },
    {
        title: "Golden Hour",
        artist: "Jvke",
        genre: "Pop",
        duration: '05:38'
    },
    {
        title: "Tentang Cinta",
        artist: "Ipang",
        genre: "Pop",
        duration: '03:50'
    },
    {
        title: "Kita",
        artist: "Sheila On 7",
        genre: "Pop",
        duration: '04:30'
    },
    {
        title: "Seberapa Pantas",
        artist: "Sheila On 7",
        genre: "Pop",
        duration: '05:30'
    },
    {
        title: "Sahabat",
        artist: "Ipang",
        genre: "Pop",
        duration: '05:50'
    },
];


// sort by artist
function byArtist(song, artist){
    console.log(`Menampilkan list dari ${artist}`);
    const result = song.filter( param => param.artist == artist );
    console.log(result);
    return result;
    //console.log("==============================================");
}

// sort by genre
function byGenre(song, genre){
    console.log(`Menampilkan list dari ${genre}`);
    const result = song.filter( param => param.genre == genre);
    console.log(result);
    return result;
}

// by duration < 1 hour
function byDuration(song, duration){
    
    console.log(`Menampilkan list yang durasinya kurang dari ${duration} menit`)

    // cek total durasi dari list yang tersedia 
    let totalDuration = 0;

    // bikin array baru untuk nampung playlist baru 
    let newPlaylist= [];
    let newPlaylistDur = 0;

    // loop untuk push ke playlist baru berdasarkan durasi 
    for (const n of song){
        totalDuration += n.duration;

        if (totalDuration < duration){
            newPlaylist.push(n);
        }else{
            break;
        }
    }

    // untuk menghitung jumlah durasi di playlist terbaru
    for (const n of newPlaylist){
        newPlaylistDur += n.duration;
    }

    // cek playlist dan durasi baru
    console.log(newPlaylist);
    console.log(`Total durasi: ${newPlaylistDur} Menit`);
    return{random: newPlaylist, total: newPlaylistDur}
}

// by duration new
function byDurationNew(duration){
    // sort by random
    const song = list.sort( () => Math.random() - 0.1);
    // parameter duration
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
    return {Total: `${stsMenit} menit, ${stsDetik} detik`, randomList:newPlaylist}
    // console.log(`${totalDetikNew} => ${stsMenit} : ${stsDetik}`)
}

// show all data
// console.log("==============================================");
// byGenre(song, "EDM");
// byArtist(song, "Ipang");
// byDuration(song, 60);
module.exports = { list, byGenre , byArtist, byDuration, byDurationNew}
