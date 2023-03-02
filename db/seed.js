const { client, getAllUsers, createNewUser } = require('./index.js');



const dropTables = async() =>{
    try{
        console.log('DROPPING TABLES');
        await client.query(`
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
            location VARCHAR(50) NOT NULL
        );
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
       await createNewUser('Phoebe Bridgers', 'pBridg', 'GardenSong', 'California');
    }catch(err){
        console.log(err);
    }
}
rebuildTables()
 .then(testDB)
 .catch(console.error)
 .finally(()=> {client.end()
            console.log('DATABASE DISCONNECTED')})
 