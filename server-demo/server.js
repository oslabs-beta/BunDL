const express = require('express');
const path = require('path');
const cors = require('cors');
const { getRedisInfo, getRedisKeys, getRedisValues } = require('../server/src/helpers/redisHelper')
// const spiderModel = require('./models/spiderModel')
// import Spider from '../server-demo/models/spiderModel'
const app = require('express')();
const PORT = 3000;


//import static files
app.use(express.static(path.join(__dirname, '../client')));

//parse request body
app.use(express.json());
app.use(cors());

// WILL ADD DEMO ENDPOINTS HERE
// THIS IS A PLACEHOLDER FOR DEMO ENDPOINTS

// Use Redis middleware function to get from Redis cache
const redisMiddleware = getRedisInfo({
  getKeys: true,
  getValues: true, // we are getting keys as 'testKey' but values is empty array
})
// update endpoint?
// ...redisMiddleware works here too
app.get("/api/redis", redisMiddleware, (req, res) => {
  // console.log( 'RES:', res.locals); // empty object 
  // console.log('REDISMID', redisMiddleware) // empty array still rn
  return res.status(200).send(res.locals);
});

//404 error handlers
app.use((req, res) => {
  res.status(404).json('This is a 404 error');
});

//global error handlers

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown error',
    status: 500,
    message: { err: 'An error occured' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

//app listen to port
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});

