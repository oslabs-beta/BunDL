import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
//LRUcache = doubly linkedlist combined with hashmap - hashmap (empty obj)'
//least recently used = head linkedlist
import { LRUCache } from 'lru-cache';
import { generateCacheKeys, storeCacheKeys } from './helpers/cacheKeys.js';

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
    // this.pouchDB = newPouchDB('database')
  }
  // adds key value pair to the cache
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

  async clientQuery(query, variables) {
    // convert query into an AST
    const AST = parse(query.trim());
    // first grab the proto, and operation type from invoking extractAST on the query
    const { proto, operationType } = extractAST(AST, this.config, config);
    // if the incoming query doesn't have an id, it makes it hard to store it in the cache so we skip it and send it to graphql
    if (operationType === 'noID') {
      const queryResults = await fetchFromGraphQL(query);
      if (queryResults) {
        return queryResults;
      } else {
        console.log('Error fetching from DB');
        return;
      }
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

      // integrate pouch DB logic
    }
    // if it's not in our LRU cache nor pouchDB we fetch from the server
    const queryResults = await fetchFromGraphQL(query);
    // store it in our cache
    this.set(cacheKey, queryResults);
    // store it in pouchDB
    // bunCache.pouchDB.put({
    //   _id: cacheKey,
    //   data: queryResults,
    // });
    return queryResults;
  }
}

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
