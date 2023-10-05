import express from 'express';
import path from 'path';
import cors from 'cors';
// const { graphqlHTTP } = require('express-graphql');

const app = require('express')();
const schema = require('./schema.js');
import interceptQueryAndParse from '../middleware/intercept-and-parse-logic.js';
import { ApolloServer } from 'apollo-server-express';
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({ typeDefs, resolvers });

const URI = 'https://spacex-production.up.railway.app/';
const PORT = 3000;

//import static files
app.use(express.static(path.join(__dirname, '../client')));

//parse request body
app.use(express.json());
app.use(cors());

async function startServer() {
  await server.start();

  // Intercept requests sent to 'graphql' endpoint
  app.use('/graphql', interceptQueryAndParse, (req, res) => {
    console.log(req.body.query);
    server.applyMiddleware({ app });
  });
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
}

startServer();
