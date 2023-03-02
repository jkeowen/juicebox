const { client, getAllUsers, 
        createNewUser, 
        updateUser, 
        createNewPost, 
        updatePost, 
        getAllPosts, 
        getPostsByUser,
        getUserById } = require('./index.js');



const dropTables = async() =>{
    try{
        console.log('DROPPING TABLES');
        await client.query(`
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
        `);
        console.log('TABLES DROPPED');
    }catch(err){
        console.log(err)
        throw err;
    }
}


const createTables = async() =>{
    try{
    console.log('BUILDING TABLES');

    await client.query(`
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL, 
            location VARCHAR(50) NOT NULL, 
            active BOOLEAN DEFAULT true
        );

        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            "authorId" INTEGER REFERENCES users(id) NOT NULL,
            title VARCHAR(255),
            content TEXT NOT NULL, 
            active BOOLEAN DEFAULT true
        )
    `)

    console.log('DONE BUILDING TABLES');
        }catch(err){
            console.log(err);
        }
}

const rebuildTables = async() => {

    try{
        console.log('CONNECTING TO DATABASE');
        client.connect();
        console.log('CONNECTED TO DATABASE');
        await dropTables();
        await createTables();
    }catch(err){
        console.log(err);
    }

}


const testDB = async() => {
    try{
       await createNewUser('Michelle Zauner ', 'jBrekie', 'Paprika', 'Pennsylvania');
       await createNewUser('Angel Olsen', 'aOlsen', 'Lark', 'California');
       await createNewUser('Pheobe Bridgers', 'pBridg', 'GardenSong', 'California');
       await updateUser(3, {
        name: 'Phoebe Bridgers',
        location: 'LA'
       });
       await createNewPost(1, 'The Body Is A Blade', 'The body is a blade that cuts a path from day to day');
       await createNewPost(2, 'Intern', 'I just want to be alive and make something real');
       await createNewPost(3, 'Chinese Satellite', 'Why would someone do this on purpose when they could do something else');
       await createNewPost(3, 'This Is The End', 'Ahhhhhhh');
       const user = await getUserById(3);
    //    const posts = await getPostsByUser(3);
       console.log('user: ', user);
    }catch(err){
        console.log(err);
    }
}
rebuildTables()
 .then(testDB)
 .catch(console.error)
 .finally(()=> {client.end()
            console.log('DATABASE DISCONNECTED')})
 