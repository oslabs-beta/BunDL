import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
//LRUcache = doubly linkedlist combined with hashmap - hashmap (empty obj)'
//least recently used = head linkedlist
import { LRUCache } from 'lru-cache';
import {
  generateGraphQLQuery,
  generateMissingLRUCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
  generateMissingPouchDBCachekeys,
  updatePouchDB,
} from './helpers/cacheKeys';
import pouchDB from '../server/bun-server';

const defaultConfig = {
  cacheMetadata: true,
  cacheVariables: true,
  requireArguments: true,
  cacheSize: maxSize,
};

export default class BunCache {
  constructor(schema, maxSize = 100, userConfig = {}) {
    this.config = { ...defaultConfig, ...userConfig };
    this.schema = schema;
    // Create a new LRU Cache instance
    //O(1) vs O(n) map
    this.cache = new LRUCache({
      //specifies how many items can be in the cache
      max: maxSize,
    });
  }
  // if the cache is full then the least recently used item is evicted
  set(key, value) {
    this.cache.set(key, value);
  }
  // grabs the value and also updates its recency factor (recently used)
  get(key) {
    return this.cache.get(key);
  }
  // checks if our cache has the key/value
  has(key) {
    return this.cache.has(key);
  }
  // deletes any key/value
  delete(key) {
    this.cache.del(key);
  }
  // clears the ENTIRE cache
  clear() {
    this.cache.reset();
  }
  x;

  async clientQuery(query) {
    // convert query into an AST
    const AST = parse(query.trim());
    // first grab the proto, and operation type from invoking extractAST on the query
    const { proto, operationType } = extractAST(AST);
    // if the incoming query doesn't have an id, it makes it hard to store it in the cache so we skip it and send it to graphql
    if (operationType === 'noID') {
      const queryResults = await fetchFromGraphQL(query);
      if (queryResults) {
        return queryResults;
      }

       // currently doesnt support partials (checking for all keys rn)
    //create the cache keys
    const cacheKeys = generateCacheKeys(proto);
    // check the cache if this key already exists
    if (this.has(...cacheKeys)) {
      // if the key exists then return the value of that cacheKey
      const queryResults = this.get(cacheKeys);
      console.log('retrieved from cache!', queryResults);
      return queryResults;
    }


      let graphQLresponse = {
        data: {},
      };

      //check LRU cache
      const { missingCacheKeys, graphQLcachedata } = generateMissingCachekeys(
        cacheKeys,
        this.cache
      );

      // if missing cache keys array has items, meaning LRU cache does not have all requested kery
      if (missingCacheKeys.length > 0) {
        //if pouch has some or any of missing cache keys
        const { graphQLcachedata, missingPouchCacheKeys } =
          generateMissingPouchDBCachekeys(missingCacheKeys, graphQLcachedata);

        if (!missingPouchCacheKeys.length) {
          return graphQLcachedata;
        } else {
          //if pouch does not have it, send query to graphql for server side (SO WE DO NOT NEED SCHEMA FOR CLIENT SIDE)
          //convert missingCacheKeys to graphql query
          const graphQLquery = generateGraphQLQuery(missingPouchCacheKeys);
          //using the graphql query structure, fetch data from graphql
          const queryResults = await graphql(this.schema, graphQLquery);
          //---normalize results of fetch to make it readable for cachekeys
          //---const normalizedResults = normalizeResults(queryResults)

          //update cachekeys from queryResults
          const updatedCacheKeys = updateMissingCache(
            queryResults,
            missingCacheKeys
          );

          //update pouchdb with queryresults
          updatePouchDB(updatedCacheKeys);

          //update lru cache with queryresults
          //loop through updated cachekey key value pair
          for (const keys in updatedCacheKeys) {
            //save to key value properties to lru cache
            this.cache.set(keys, updatedCacheKeys[keys]);
          }
          //generate graphQL response from cache and merge response
          graphQLresponse = mergeGraphQLresponses(
            graphQLcachedata,
            queryResults
          );
        }
      }



      // integrate pouch DB logic
    }
  }
}
  

//if fields includes address then match value of address to key of address in query
//query -> Lru cache -> check poochdb -> if it is in poochdb, how to get just the values we need
//db.find(id, company, city, department, product)
//put - automatically set pooch id

//     return `{${protoKeys
//       // map over all of the keys and recursively call each one to handle nested objects
//       .map((key) => `"${key}":${serializeTheProto(proto[key])}`)
//       .join(',')}}`;
//   }
//   return JSON.stringify(proto);
// };


// function to handle post requests to the server
const fetchFromGraphQL = async (query) => {
  // graphQL queries can be both complex and long so making POST requests are more suitable than GET
  const response = await fetch('/graphql', {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' },
  });
  return await response.json();
};

// console.log('----- Initializing BunCache -----');
// const bunCache = new BunCache();

// console.log("----- Setting Key 'a' with value '1' -----");
// bunCache.set('a', 1);
// console.log(bunCache.cache.dump()); // This will show the current cache content. You might need to inspect the object structure.

// console.log("----- Getting Key 'a' -----");
// const valA = bunCache.get('a');
// console.log("Value of key 'a':", valA); // Expected: 1

// console.log("----- Checking if Key 'a' exists -----");
// const hasA = bunCache.has('a');
// console.log("Does key 'a' exist?", hasA); // Expected: true

// console.log('----- Running clientQuery with a GraphQL query -----');
// const gqlQuery = `
// {
//   user (id: "6521aebe1882b34d9bc89017") {
//     id
//     firstName
//     lastName
//     email
//     phoneNumber
//     address {
//       street
//       city
//       state
//       zip
//       country
//     }
//   }
// }`;

// const results = await bunCache.clientQuery(gqlQuery);
// console.log(results);
// .then((result) => {
//   console.log('Result of the clientQuery:', result);
// })
// .catch((error) => {
//   console.error('Error during the clientQuery:', error);
// });
