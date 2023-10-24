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
} from './helpers/queryHelpers.js';
const PouchDB = require('pouchdb');

//mport pouchDB from '../server/bun-server';

const defaultConfig = {
  cacheMetadata: true,
  cacheVariables: true,
  requireArguments: true,
  cacheSize: 100,
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
    this.pouchDB = new PouchDB('bundl-database');
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

  async fetchFromGraphQL(query) {
    // graphQL queries can be both complex and long so making POST requests are more suitable than GET
    const response = await fetch('/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: query }),
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  }

  async clientQuery(query) {
    // convert query into an AST
    const AST = parse(query.trim());
    // first grab the proto, and operation type from invoking extractAST on the query
    const { proto, operationType } = extractAST(AST);
    // if the incoming query doesn't have an id, it makes it hard to store it in the cache so we skip it and send it to graphql
    if (operationType === 'noID') {
      // top level doesn't have an id
      const queryResults = await fetchFromGraphQL(query); // needs to be fixed
      if (queryResults) {
        return queryResults;
      }
      //create the cache keys
      const cacheKeys = generateCacheKeys(proto);
      //cachekeys = ['query: artist: 123:name', 'query: artist: 123:id']
      // check the cache if this key already exists

      //check LRU cache
      const { missingCacheKeys, graphQLcachedata } =
        generateMissingLRUCachekeys(cacheKeys, this.cache);

      // if missing cache keys array has items, meaning LRU cache does not have all requested kery
      if (missingCacheKeys.length > 0) {
        //if pouch has some or any of missing cache keys
        const { updatedgraphQLcachedata, missingPouchCacheKeys } =
          await generateMissingPouchDBCachekeys(
            missingCacheKeys,
            graphQLcachedata,
            this.pouchDB
          );

        if (!missingPouchCacheKeys.length) {
          return updatedgraphQLcachedata;
        } else {
          //if pouch does not have it, send query to graphql for server side (SO WE DO NOT NEED SCHEMA FOR CLIENT SIDE)
          //convert missingCacheKeys to graphql query
          const graphQLquery = generateGraphQLQuery(missingPouchCacheKeys);
          //using the graphql query structure, fetch data from graphql
          const queryResults = await fetchFromGraphQL(graphQLquery);
          //---normalize results of fetch to make it readable for cachekeys
          //---const normalizedResults = normalizeResults(queryResults)

          //update cachekeys from queryResults
          const updatedCacheKeys = updateMissingCache(
            queryResults,
            missingCacheKeys
          );

          //update pouchdb with queryresults
          await updatePouchDB(updatedCacheKeys, this.pouchDB);

          //update lru cache with queryresults
          //loop through updated cachekey key value pair
          for (const keys in updatedCacheKeys) {
            //save to key value properties to lru cache
            this.cache.set(keys, updatedCacheKeys[keys]);
          }
          //generate graphQL response from cache and merge response
          return mergeGraphQLresponses(updatedgraphQLcachedata, queryResults);
        }
      }

      return graphQLcachedata;
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
  try {
    // graphQL queries can be both complex and long so making POST requests are more suitable than GET
    const response = await fetch('/graphql', {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error during fetch:', error);
    throw error; // Rethrow the error for higher-level handling
  }
};
