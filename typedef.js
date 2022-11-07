const { ApolloServer, gql } = require('apollo-server-express');


// Construct a schema, using GraphQL schema language
const typeDefs = gql`
type User{
    id: ID
    username: String
    password: String
    role: String
}

type Song{
    id: ID
    title: String
    artist: String
    genre: String
    duration: String
}

type Song_list{
    song_ids: Song
}

type Songlist{
    id: ID
    count: Int
    name: String
    list: [Song_list]
    total_duration: String
    total_duration_detik: String
}

type Page_Songlist{
    data: [Songlist]
    playlist_count: Int
    page: String
}

type login{
    status: String
}

type Query {
    getSongBy(id:ID, title: String, artist: String, genre: String): [Song]
    getAllSonglist(page: Int, limit: Int): Page_Songlist
    login(username: String, password: String, secret: String): login
    auth(token: String): login
    getUser: [User]
}

type Mutation{
    addRandomPlaylistDuration(title: String, duration: Int): Songlist
    deleteSonglist(id: String): Songlist
    updateSongPlaylist(id: String, song_id: String): Songlist
    register(username: String, password: String, role: String): User
}

`;

module.exports = { typeDefs } ;