const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/juicebox-dev');

// const createNewUser = (username)

const getAllUsers = async() => {
    console.log('GETTING ALL USERS');
    const {rows} = await client.query(`
        SELECT * 
          FROM users;
    `)
    console.log('GOT ALL USERS:', rows);
};

const createNewUser = async(name, username, password, location) => {
    try{
    console.log('CREATING NEW USER');
    await client.query(`
        INSERT INTO users(name, username, password, location) 
        VALUES($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
    `, [name, username, password, location]);
    console.log('CREATED NEW USER')
    }catch(err){
        console.log(err);
        throw err;
    }
};

const updateUser = async(id, fields={}) =>{

    const setString = Object.keys(fields).map((key, index) => `"${ key }"=$${ index + 1}` 
        ).join(', ');

        if(setString === 0) return;

    try{
        console.log(`UPDATING USER ${id}`);
        const { rows } = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));
        console.log(`UPDATED USER ${id}`);
        return rows;
    }catch(err){
        console.log("ERROR CREATING POST");
        throw err;
    }
};

const createNewPost = async(
    authorId, 
    title, 
    content
) =>{
    try{
        console.log('CREATING NEW POST')
        const { rows } = await client.query(`
            INSERT INTO posts ("authorId", title, content)
            VALUES($1, $2, $3)
            RETURNING *;
        `, [ authorId, title, content ] )
        console.log('NEW POST CREATED')
        return rows;
    }catch(err){
        console.log(err);
        throw err;
    }
}

const updatePost =  async(id, fields = {}) =>{
    const setString = Object.keys(fields).map((key, index)=> `${ key }=$${ index + 1 }`
        ).join(', ');

        if(setString.length === 0) return
    try{
        console.log('UPDATING POST');
        await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id = ${ id };
        `,Object.values(fields));
        console.log('POST UPDATED');
    }catch(err){
        console.log(err)
        throw err
    }
};

const getAllPosts = async() => {
    try{
        console.log('GETTING ALL POSTS');
        const { rows } = await client.query(`
            SELECT * 
              FROM posts;
        `)
        console.log('GOT ALL POSTS');
        return rows;

    }catch(err){
        console.log(err);
        throw err
    }
};

const getPostsByUser = async(authorId) =>{
    try{
        console.log('GETTING A USERS POST');
        const { rows } = await client.query(`
            SELECT * 
              FROM posts
              WHERE "authorId"=$1;
        `, [authorId])
        console.log('GOT A USERS POSTS')
        return rows;
    }catch(err){
        console.log(err);
        throw err;
    }
};

const getUserById = async(userId)=>{
    try{
        const posts = await getPostsByUser(userId);
        console.log('GETTING USER BY ID');
        const { rows } = await client.query(`
            SELECT users.id, username, name, location
            FROM users
            WHERE users.id= ${userId};
        `);
        console.log('GOT USER BY ID');
        if(rows.length === 0) return null;
        else{
        rows[0].posts = posts;
        return rows[0];}
    }catch(err){
        console.log(err);
        throw err;
    }
};



module.exports ={
    client,
    getAllUsers,
    createNewUser,
    updateUser, 
    createNewPost,
    updatePost, 
    getAllPosts,
    getPostsByUser,
    getUserById
}