// Song list

const song = [
    {
        title: "Till It Hurts",
        artist: "Yellow Claw",
        genre: "EDM",
        duration: 5
    },
    {
        title: "Both Of Us",
        artist: "Yellow Claw",
        genre: "EDM",
        duration: 5
    },
    {
        title: "Lunatic",
        artist: "Weird Genius",
        genre: "EDM",
        duration: 4
    },
    {
        title: "LATHI",
        artist: "Weird Genius",
        genre: "EDM",
        duration: 6
    },
    {
        title: "Sweet Scar",
        artist: "Weird Genius",
        genre: "EDM",
        duration: 4
    },
    {
        title: "Kingslayer",
        artist: "BMTH",
        genre: "Rock",
        duration: 6
    },
    {
        title: "ABC feat. Sophia",
        artist: "Polyphia",
        genre: "Rock",
        duration: 5
    },
    {
        title: "Euphoria",
        artist: "Polyphia",
        genre: "Rock",
        duration: 4
    },
    {
        title: "Beraksi",
        artist: "Kotak",
        genre: "Rock",
        duration: 4
    },
    {
        title: "Terbang",
        artist: "Kotak",
        genre: "Rock",
        duration: 3
    },
    {
        title: "Golden Hour",
        artist: "Jvke",
        genre: "Pop",
        duration: 3
    },
    {
        title: "Tentang Cinta",
        artist: "Ipang",
        genre: "Pop",
        duration: 4
    },
    {
        title: "Kita",
        artist: "Sheila On 7",
        genre: "Pop",
        duration: 5
    },
    {
        title: "Seberapa Pantas",
        artist: "Sheila On 7",
        genre: "Pop",
        duration: 4
    },
    {
        title: "Sahabat",
        artist: "Ipang",
        genre: "Pop",
        duration: 4
    },
];

// sort by artist
function byArtist(song, artist){
    console.log(`Menampilkan list dari ${artist}`);
    const sort = song.filter( param => param.artist == artist );
    console.log(sort);
    console.log("==============================================");
}

// sort by genre
function byGenre(song, genre){
    console.log(`Menampilkan list dari ${genre}`);
    const sort = song.filter( param => param.genre == genre);
    console.log(sort);
    console.log("==============================================");
}

// by duration < 1 hour
function byDuration(song, duration){

    console.log(`Menampilkan list yang durasinya kurang dari ${duration} menit`)

    // cek total durasi dari list yang tersedia 
    let totalDuration = 0;

    // bikin array baru untuk nampung playlist baru 
    let newPlaylist= [];
    let newPlaylistDur = 0;

    // loop untuk push ke playlist baru berdasarkan durasi < 60
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
}

// show all data
console.log("==============================================");
byGenre(song, "Rock");
byArtist(song, "Ipang");
byDuration(song, 50);
