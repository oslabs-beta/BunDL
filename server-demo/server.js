import express from 'express';
import path from 'path';
import cors from 'cors';
import interceptQueryAndParse from '../middleware/intercept-and-parse-logic.js';
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const { User, schema } = require('../fakeData/schema.js');
const URI =
  'mongodb+srv://apwicker:5QGUvCSrLZSswi7h@gradassessmentcluster.ki6oxrk.mongodb.net/bundl-test';

const app = require('express')();
const PORT = 3000;

mongoose.connect(URI);
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

//import static files
app.use(express.static(path.join(__dirname, '../client')));

//parse request body
app.use(express.json());
app.use(cors());

// Intercept requests sent to 'graphql' endpoint
app.use(
  '/graphql',
  // interceptQueryAndParse,
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
// WILL ADD DEMO ENDPOINTS HERE
// THIS IS A PLACEHOLDER FOR DEMO ENDPOINTS
app.get('/test', (req, res) => {
  res.send('🐱 This is a test route! 🚀');
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
