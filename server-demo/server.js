const express = require("express");
import redisCacheMain from '../server/helpers/redisConnection'
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
} = require("graphql");

//Async query (req,res,next) { #CODE#}

const { getRedisInfo, getRedisKeys, getRedisValues } = require('../server/src/helpers/redisHelper');

const app = require('express')();
const PORT = 3000;

// Check for connection errors
client.on("error", (error) => {
  console.error("Redis connection error:", error);
});

// Perform Redis operations here
// ...

// When you're done with the Redis client, close it
client.quit((err) => {
  if (err) {
    console.error("Error closing Redis client:", err);
  } else {
    console.log("Redis client closed.");
  }
});

// Define the User type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLID }, // Use GraphQLID for unique identifiers
    name: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});

// Define the root query type
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve: async (parent, args) => {
        const userID = args.id;
        // Check if the user data is in Redis cache
        const cachedUserData = await getCachedUserData(userID);
        if (cachedUserData) {
          return cachedUserData;
        } else {
          // If not in cache, fetch the data from your database or another source
          const userData = await fetchUserDataFromDatabase(userID);
          await cacheUserData(userID, userData);
          // Cache the fetched data in Redis
          return userData;
        }
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQueryType,
});

function getCachedUserData(userId) {
  return new Promise((resolve, reject) => {
    client.get(userId, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

function cacheUserData(userId, userData) {
  return new Promise((resolve, reject) => {
    client.set(userId, JSON.stringify(userData), (err) => {
      if (err) {
        reject(err);
      } else {
        // Set an expiration time for the cache if needed
        client.expire(userId, 3600); // Expires in 1 hour
        resolve();
      }
    });
  });
}

function fetchUserDataFromDatabase(userId) {
  // Replace this with your actual database query
  return new Promise((resolve) => {
    setTimeout(() => {
      const userData = {
        id: userId,
        name: "John Doe",
        email: "john.doe@example.com",
      };
      resolve(userData);
    }, 1000); // Simulate a delay
  });
}

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true, // Enable the GraphiQL UI for testing
  })
);

app.use((req, res) => {
  res.status(404).json("This is a 404 error");
});

app.use((err, req, res, next) => {
  const defaultErr = {
    log: "Express error handler caught an unknown error",
    status: 500,
    message: { err: "An error occurred" },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});
