import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
import generateCacheKeys from './helpers/cacheKeys';
import { db } from './helpers/pouchHelpers.js';
import { LRUCache } from 'lru-cache';
import {
  generateGraphQLQuery,
  generateMissingLRUCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
  generateMissingPouchDBCachekeys,
  updatePouchDB,
} from './helpers/queryHelpers.js';

const defaultConfig = {
  cacheMetadata: false,
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
    this.pouchDB = db;
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

  async clientQuery(query) {
    const allDocs = await this.pouchDB.allDocs();
    console.log('this.pouchDB :', allDocs);
    const start = performance.now();
    let end;
    let speed;
    // convert query into an AST
    const AST = parse(query.trim());
    // first grab the proto, and operation type from invoking extractAST on the query
    const { proto, operationType } = extractAST(AST, this.config);
    console.log('proto: ', proto);
    console.log('ast operationtype', operationType);

    // if the incoming query doesn't have an id, it makes it hard to store it in the cache so we skip it and send it to graphql
    if (operationType === 'noArguments') {
      // top level doesn't have an id
      console.log(' invalid operation type');
      console.log('client query operation type: ', operationType);
      const queryResults = await fetchFromGraphQL(query); //
      end = performance.now();
      speed = end - start;
      let cachedata = { cache: 'hit', speed: speed };
      if (queryResults) {
        return { queryResults, cachedata };
      }
    }

    //create the cache keys
    const cacheKeys = generateCacheKeys(proto);

    // check the LRU cache if this key already exists
    const { missingCacheKeys, graphQLcachedata } = generateMissingLRUCachekeys(
      cacheKeys,
      this.cache
    );

    console.log('LRU missing', missingCacheKeys);
    console.log('LRU graphql', graphQLcachedata);

    // if missing cache keys array has items, meaning LRU cache does not have all requested kery
    if (missingCacheKeys.length > 0) {
      //if pouch has some or any of missing cache keys

      const { updatedgraphQLcachedata, missingPouchCacheKeys } =
        await generateMissingPouchDBCachekeys(missingCacheKeys, graphQLcachedata, this.pouchDB);

      console.log('missingpouch', missingPouchCacheKeys);

      if (!missingPouchCacheKeys.length) {
        end = performance.now();
        speed = end - start;
        let cachedata = { cache: 'hit', speed: speed };
        return { updatedgraphQLcachedata, cachedata };
      } else {
        //if pouch does not have it, send query to graphql for server side (SO WE DO NOT NEED SCHEMA FOR CLIENT SIDE)
        //convert missingCacheKeys to graphql query
        const graphQLquery = generateGraphQLQuery(missingPouchCacheKeys);
        console.log('query', graphQLquery);
        //using the graphql query structure, fetch data from graphql
        const { returnObj, cachedata } = await fetchFromGraphQL(graphQLquery);

        console.log('queryresults', returnObj);
        console.log('cachedata', cachedata);

        //update cachekeys from queryResults
        const updatedCacheKeys = updateMissingCache(returnObj, missingPouchCacheKeys);

        console.log('updatedcachekeys', updatedCacheKeys);

        //update pouchdb with queryresults
        //await updatePouchDB(updatedCacheKeys, this.pouchDB);

        //update lru cache with queryresults
        //loop through updated cachekey key value pair
        for (const keys in updatedCacheKeys) {
          //save to key value properties to lru cache
          this.cache.set(keys, updatedCacheKeys[keys]);
        }

        //generate graphQL response from cache and merge response
        const newgraphql = mergeGraphQLresponses(updatedgraphQLcachedata, returnObj);
        return { newgraphql, cachedata };
      }
    }
    end = performance.now();
    speed = end - start;
    let cachedata = { cache: 'hit', speed: speed };
    return { graphQLcachedata, cachedata };
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
      body: JSON.stringify({ query: query }),
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
