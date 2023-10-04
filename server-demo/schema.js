// String-based notation: Schema Definition Language (SDL)
// Commonly used with Apollo Server

// const fetch = require('node-fetch');
// const API_ENDPOINT_FOR_ROCKETS = 'https://spacex-production.up.railway.app/';
// const API_ENDPOINT_FOR_SHIPS = 'https://spacex-production.up.railway.app/';

// const typeDefs = `
//   type Rocket {
//     id: String!
//     name: String!
//     stages: Int!
//     country: String!
//     active: Boolean!
//     wikipedia: String!
//   }

//   type Ship {
//     id: String!
//     name: String!
//     image: String!
//   }

//   type Query {
//     rockets: [Rocket]
//     ships: [Ship]
//   }
//   `;

// const resolvers = {
//   Query: {
//     rockets: async (parent, args, contextValue) => {
//       try {
//         const response = await fetch(API_ENDPOINT_FOR_ROCKETS);
//         const data = await response.json();
//         console.log(data);
//         return data;
//       } catch (error) {
//         console.error('Failed to fetch ROCKETS: ', error);
//         throw new Error('Failed to fetch ROCKETS');
//       }
//     },
//     ships: async () => {
//       try {
//         const response = await fetch(API_ENDPOINT_FOR_SHIPS);
//         const data = await response.json();
//         console.log(data);
//         return data;
//       } catch (error) {
//         console.error('Failed to fetch SHIPS: ', error);
//         throw new Error('Failed to fetch SHIPS');
//       }
//     },
//   },
// };
// module.exports = {
//   typeDefs,
//   resolvers,
// };

// GraphQL.js notation
// Uses GraphQL's built-in functions to define the schema programmatically
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';

const RocketType = new GraphQLObjectType({
  name: 'Rocket',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    stages: { type: GraphQLInt },
    country: { type: GraphQLString },
    active: { type: GraphQLBoolean },
    wikipedia: { type: GraphQLString },
  }),
});

const ShipType = new GraphQLObjectType({
  name: 'Ship',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    image: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    rockets: {
      type: new GraphQLList(RocketType),
      async resolve(parent, args, context) {
        try {
          const response = await fetch(API_ENDPOINT_FOR_ROCKETS);
          const data = await response.json();
          console.log(data);
          return data;
        } catch (error) {
          console.error('Failed to fetch ROCKETS: ', error);
          throw new Error('Failed to fetch ROCKETS');
        }
      },
    },
    ships: {
      type: new GraphQLList(ShipType),
      async resolve(parent, args, context) {
        try {
          const response = await fetch(API_ENDPOINT_FOR_SHIPS);
          const data = await response.json();
          console.log(data);
          return data;
        } catch (error) {
          console.error('Failed to fetch SHIPS: ', error);
          throw new Error('Failed to fetch SHIPS');
        }
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = schema;
