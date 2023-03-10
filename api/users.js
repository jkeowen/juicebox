const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createNewUser, getUserById, updateUser } = require('../db');
const { requireUser } = require('./utils')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;

usersRouter.use(bodyParser.json());

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
    next();
});

usersRouter.post('/register', async(req, res, next) => {
    const { name, username, password, location } = req.body;
    try{
        const _user = await getUserByUsername(username);
        if(_user){
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }
        const user = await createNewUser(
            name,
            username,
            password,
            location,
        );
        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET,{
            expiresIn: '1w'
        });
        res.send({
            message: "thank you for signing up",
            token
        });
    }catch({name, message}){
        next({name, message})
    }
});

usersRouter.post('/login', async(req, res, next) => {

    const { username, password } = req.body;
    if(!username || !password){

        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }
        try{
            const user = await getUserByUsername(username);
            const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET)
            if(user && user.password == password){
                res.send({message: "you're logged in!", "token": `${token}`});
                res.end();
            }else{
                next({
                name:'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
                });
            }

        }catch(err){
            console.log(err);
            next(err);
        }
});

usersRouter.delete('/:userId', requireUser, async(req, res, next)=> {
    const userId = req.params.userId;
    
    try{
        const user = await getUserById(userId)
        if(user && user.id === req.user.id){
            await updateUser(user.id, {active: false});
            const updatedUsers = await getAllUsers();
            res.send(updatedUsers);
        }else{
            next(user ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a user that isn't you!"
            }:{
                name: "UserNotFoundError",
                message: "That user does not exist"
            }
            )
        }
    }catch({name, message}){
        next({name, message});
    }
})




usersRouter.get('/', async(req, res) => {
    const users = await getAllUsers();
    res.send({
        users
    });
});



module.exports = usersRouter;