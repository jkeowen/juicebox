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
}

module.exports ={
    client,
    getAllUsers,
    createNewUser
}