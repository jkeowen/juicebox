const express = require('express');
const postsRouter = express.Router();
const { getAllPosts } = require('../db');

postsRouter.use((req, res, next) => {
    console.log('A request a has been made to /posts')
    next();
})

postsRouter.get('/', async(req, res) => {
    const posts = await getAllPosts();

    res.send([
        posts
    ]);
});

module.exports = postsRouter;

