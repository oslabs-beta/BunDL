import express from 'express';
import redisCacheMain from '../bunDL-server/src/helpers/redisConnection';
import { openInEditor } from 'bun';
// CHECK FILE PATH ON ALL - SHOULD BE SERVER TO SRC TO HELPERS TO REDISCONNECTION
import BundlServer from '../bunDL-server/src/bundl';
import { schema } from './schema';
import { graphqlHTTP } from 'express-graphql';
import bodyParser from 'body-parser';
import BundlClient from '../bunDL-client/src/bunCache';

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
} = require('graphql');

const {
  getRedisInfo,
  getRedisKeys,
  getRedisValues,
} = require('../bunDL-server/src/helpers/redisHelper');

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 3000;

const bunDLServer = new BundlServer(
  schema,
  3600,
  redisCacheMain.redisPort,
  redisCacheMain.redisHost
  //redisPassword:
);

// this tests bunDL SERVER-side middleware
// app.post('/graphql', bunDLServer.query, (req, res) => {
//   return res.status(200).send(res.locals.queryResults);
// });

// this tests bunDL CLIENT-side middleware
app.post('/graphql', graphqlHTTP, (req, res) => {
  return res.status(200).send(res.locals.queryResults);
});

app.use((req, res) => {
  res.status(404).json('This is a 404 error');
});

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught an unknown error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});
