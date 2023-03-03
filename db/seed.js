const { client, 
        getAllUsers, 
        createNewUser, 
        updateUser, 
        createNewPost, 
        updatePost, 
        getAllPosts, 
        getPostsByUser,
        getUserById,
        createTags, 
        createPostTag, 
        addTagsToPost,
        getPostById,
        getPostsByTagName} = require('./index.js');



const dropTables = async() =>{
    try{
        console.log('DROPPING TABLES');
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS tags;
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
        );

        CREATE TABLE tags(
            id SERIAL PRIMARY KEY UNIQUE,
            name VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE post_tags(
            "postId"  INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
             CONSTRAINT UC_posttags UNIQUE("tagId")
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

const createNewUsers = async() => {
    try{
        console.log('STARTING TO CREATE USERS');
        await createNewUser('Michelle Zauner ', 'jBrekie', 'Paprika', 'Pennsylvania');
        await createNewUser('Angel Olsen', 'aOlsen', 'Lark', 'California');
        await createNewUser('Phoebe Bridgers', 'pBridg', 'GardenSong', 'California');
        console.log('USERS CREATED');


    }catch(err){
        console.log(err)
    }
}

const createNewPosts = async() => {
    try{
        console.log('STARTING TO CREATING NEW POSTS');
        await createNewPost(1, 'The Body Is A Blade', 'The body is a blade that cuts a path from day to day');
        await createNewPost(2, 'Intern', 'I just want to be alive and make something real');
        await createNewPost(3, 'Chinese Satellite', 'Why would someone do this on purpose when they could do something else');
        await createNewPost(3, 'This Is The End', 'Ahhhhhhh');
        console.log('NEW POSTS CREATED');


    }catch(err){
        console.log(err)
    }
}

const createInitialTags = async() => {
    try{
        console.log("STARTING TO CREATE TAGS...");

        const [happy, sad, inspo, catman] = await createTags([
            '#happy', 
            '#worst-day-ever',
            '#youcandoanything',
            '#catmandoeverything'
        ]);
        console.log('created tags')
        const [postOne, postTwo, postThree] = await getAllPosts();
        await addTagsToPost(postOne.id, [happy, inspo]);
        await addTagsToPost(postTwo.id, [sad, inspo]);
        await addTagsToPost(postThree.id, [happy, catman, inspo]);
        console.log('FINISHED CREATING TAGS!');

    }catch(err){
        console.log(err);
    }
}


const testDB = async() => {
    try{
       await createNewUsers();
       await createNewPosts();
      await createInitialTags();
      console.log('*TEST getPostsByTagName');
      console.log(await getPostsByTagName('#happy'))
    }catch(err){
        console.log(err);
    }
}
rebuildTables()
 .then(testDB)
 .catch(console.error)
 .finally(()=> {client.end()
            console.log('DATABASE DISCONNECTED')})
 