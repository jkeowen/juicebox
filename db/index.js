const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/juicebox-dev');

// const createNewUser = (username)

const getAllUsers = async() => {
    try{
    const {rows} = await client.query(`
        SELECT * 
          FROM users;
    `)
        return rows;
}catch(err){
        console.log(err);
    }
};

const createNewUser = async(name, username, password, location) => {
    try{
    await client.query(`
        INSERT INTO users(name, username, password, location) 
        VALUES($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
    `, [name, username, password, location]);
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
        const { rows } = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));
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
        const { rows } = await client.query(`
            INSERT INTO posts ("authorId", title, content)
            VALUES($1, $2, $3)
            RETURNING *;
        `, [ authorId, title, content ] )
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
        await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id = ${ id };
        `,Object.values(fields));
    }catch(err){
        console.log(err)
        throw err
    }
};

const getAllPosts = async() => {
    try{
        const  {rows} = await client.query(`
            SELECT * 
              FROM posts;
        `)
        return rows;

    }catch(err){
        console.log(err);
        throw err
    }
};

const getPostsByUser = async(authorId) =>{
    try{
        const { rows } = await client.query(`
            SELECT * 
              FROM posts
              WHERE "authorId"=$1;
        `, [authorId])
        return rows;
    }catch(err){
        console.log(err);
        throw err;
    }
};

const getUserById = async(userId)=>{
    try{
        const posts = await getPostsByUser(userId);
        const { rows } = await client.query(`
            SELECT users.id, username, name, location
            FROM users
            WHERE users.id= ${userId};
        `);
        if(rows.length === 0) return null;
        else{
        rows[0].posts = posts;
        return rows[0];}
    }catch(err){
        console.log(err);
        throw err;
    }
};

const createTags = async(tagList) =>{
    if(tagList.length === 0) return;

    const insertValues = tagList.map(
        (_, index) => `$${index + 1}`).join('), (');
    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');
    try{
       await client.query(`
            INSERT INTO tags(name) 
              VALUES(${insertValues})
              ON CONFLICT(name) DO NOTHING;`,[...tagList])
        const { rows } = await client.query(`    
              SELECT * 
              FROM tags
              WHERE name IN (${selectValues});
        `, [...tagList]);
        return rows;

    }catch(err){
        console.log(err)
    }
}

const createPostTag = async(postId, tagId) =>{
    try{
        console.log('starting adding to post_tags')
        await client.query(`
            INSERT INTO post_tags ("postId", "tagId") 
            VALUES($1, $2)
            ON CONFLICT ("tagId") DO NOTHING;
        `, [postId, tagId]);
        console.log('finished adding to post_tags')
    }catch(err){
        console.log(err);
    }
}

const getPostById = async(postId) =>{
    try{
        const { rows: [ post ] } = await client.query(`
            SELECT * 
            FROM posts
            WHERE id=$1;
        `, [postId]);
        const { rows: tags } = await client.query(`
            SELECT tags.* 
            FROM tags
            JOIN post_tags ON tags.id = post_tags."tagId"
            WHERE post_tags."postId"=$1;
        ` [postId]);
        const { rows: [author] } = await client.query(`
            SELECT id, username, name, location
            FROM users
            WHERE id=$1;
        `[post.authorId]);

        post.tags = tags;
        console.log(post.tags);
        post.author = author;
        delete post.authorId;
        return post;
    }catch(err){
        console.log(err);
    }
}

const addTagsToPost = async(postId, tagList) => {
    try{
        console.log('STARTING TAGLIST ADD');
        const createPostTagPromises = tagList.map(
            (tag) => {
                createPostTag(postId, tag.id)}
        );
        await Promise.all(createPostTagPromises);
        console.log('FINISHED TAGLIST ADD');
        console.log('Starting getPostById')
        return await getPostById(postId);
    }catch(err){
        console.log(err);
    }
}

module.exports ={
    client,
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
    addTagsToPost
}