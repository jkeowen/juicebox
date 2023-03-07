require('dotenv').config();

const express = require('express');
const server = express();
const apiRouter = require('./api/index');
const morgan = require('morgan');
const { client } = require('./db');
client.connect();

server.use(morgan('dev'));

server.use('/api', apiRouter);

const PORT = process.env.PORT || 5012;

// client.connect();

server.listen(PORT, ()=>{
    console.log(`LISTENING ON PORT ${PORT}`);
})