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

//Async query (req,res,next) { #CODE#}

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

// Check for connection errors

// Perform Redis operations here
// ...

// When you're done with the Redis client, close it

// Define the User type
// const UserType = new GraphQLObjectType({
//   name: 'User',
//   fields: {
//     id: { type: GraphQLID }, // Use GraphQLID for unique identifiers
//     name: { type: GraphQLString },
//     email: { type: GraphQLString },
//   },
// });

//Define the root query type
// const RootQueryType = new GraphQLObjectType({
//   name: 'Query',
//   fields: {
//     user: {
//       type: UserType,
//       args: { id: { type: GraphQLID } },
//       resolve: async (parent, args) => {
//         const userID = args.id;
//         // Check if the user data is in Redis cache
//         const cachedUserData = await getCachedUserData(userID);
//         if (cachedUserData) {
//           return cachedUserData;
//         } else {
//           // If not in cache, fetch the data from your database or another source
//           const userData = await fetchUserDataFromDatabase(userID);
//           await cacheUserData(userID, userData);
//           // Cache the fetched data in Redis
//           return userData;
//         }
//       },
//     },
//   },
// });

// const schema = new GraphQLSchema({
//   query: RootQueryType,
// });

// function getCachedUserData(userId) {
//   return new Promise((resolve, reject) => {
//     client.get(userId, (err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(JSON.parse(data));
//       }
//     });
//   });
// }

const bundlCache = new BunDL(
  schema,
  3600,
  redisCacheMain.redisPort,
  redisCacheMain.redisHost
  //redisPassword:
);

app.get('/test', (req, res) => {
  console.log('this is test');
});
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