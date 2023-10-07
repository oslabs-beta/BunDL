import express from 'express';
import redisCacheMain from '../server/src/helpers/redisConnection';
import { openInEditor } from 'bun';
// CHECK FILE PATH ON ALL - SHOULD BE SERVER TO SRC TO HELPERS TO REDISCONNECTION
import BunDL from '../middleware/bundl';
import { User, schema } from './schema';
import { graphqlHTTP } from 'express-graphql';
import bodyParser from 'body-parser';

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
  return res.status(200).send(res.locals.queryResults);
});

// app.use(
//   '/graphql',
//   graphqlHTTP({
//     schema: schema,
//     graphiql: true, // set to false if you don't want the GraphQL IDE
//     // context, rootValue, and other configurations go here if needed
//   })
// );

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
