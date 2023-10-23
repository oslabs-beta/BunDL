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

export default class BunCache {
  constructor(schema = 0, maxSize = 100) {
    //this.schema = schema;
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

  async clientQuery(proto) {
    // // intercept query
    // const query = req.body.query;
    // // convert query into an AST
    // const AST = parse(query);
    // // deconstruct the proto, and operation type from invoking extractAST on the query
    // const { proto, operationType } = extractAST(AST);

    try {
      if (operationType === 'noID') {
        const queryResults = await fetchFromGraphQL(query);
        return queryResults;
      }

      //generate cachekeys from proto
      const cacheKeys = generateCacheKeys(proto);

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

      //send results back to client
      return graphQLresponse;
    } catch (err) {
      console.log(err);
    }
  }
}

//if fields includes address then match value of address to key of address in query
//query -> Lru cache -> check poochdb -> if it is in poochdb, how to get just the values we need
//db.find(id, company, city, department, product)
//put - automatically set pooch id

//artist 1
//albums: [1,2,3,4]
