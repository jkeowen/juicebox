const express = require('express');
const tagsRouter = express.Router();
const { getAllTags, getPostsByTagName } = require('../db');

tagsRouter.use((req, res, next)=>{
    console.log('A request to /tags has been made');
    next();
});


tagsRouter.get('/', async(req, res)=>{
    const tags = await getAllTags();
    res.send([
        tags
    ]);
});

tagsRouter.get('/:tagName/posts', async (req, res, next) =>{
    const tagName = req.params.tagName    
    try{
        const posts = await getPostsByTagName(tagName);
        if(posts.length > 0){
        res.send(posts)}
        else{
            res.send('No posts have that tag!')
        }

    }catch({name, message}){
        next({name, message})
    }
})

module.exports= tagsRouter;
