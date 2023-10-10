import express from 'express';
import redisCacheMain from '../server/src/helpers/redisConnection';
import { openInEditor } from 'bun';
// CHECK FILE PATH ON ALL - SHOULD BE SERVER TO SRC TO HELPERS TO REDISCONNECTION
import BunDL from '../middleware/bundl';
import schema from './schema';
import { graphqlHTTP } from 'express-graphql';
import bodyParser from 'body-parser';
import cors from 'cors';

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
} = require('../server/src/helpers/redisHelper');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 3000;

const bundlCache = new BunDL(
  schema,
  3600,
  redisCacheMain.redisPort,
  redisCacheMain.redisHost
  //redisPassword:
);

app.post('/graphql', bundlCache.query, (req, res) => {
  return res.status(200).json(res.locals.queryResults);
});

app.post('/api/query', bundlCache.query, (req, res) => {
  console.log('this is reslocals speed', res.locals.speed);
  return res.status(200).json(res.locals.speed);
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
