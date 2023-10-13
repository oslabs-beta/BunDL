import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
import { LRUCache } from 'lru-cache';
import { generateCacheKeys, storeCacheKeys } from './helpers/cacheKeys.js';

export default class BunCache {
  constructor(schema, maxSize = 100) {
    this.schema = schema;
    // Create a new LRU Cache instance
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
      } else {
        console.log('Error fetching from DB');
        return;
      }
    }

    //create the cache keys
    const cacheKeys = generateCacheKeys(proto);
    // check the cache if this key already exists
    if (bunCache.has(...cacheKeys)) {
      // if the key exists then return the value of that cacheKey
      const queryResults = bunCache.get(cacheKeys);
      console.log('retrieved from cache!', queryResults);
      return queryResults;

      // integrate pouch DB logic
    }
    // if it's not in our LRU cache nor pouchDB we fetch from the server
    const queryResults = await fetchFromGraphQL(query);
    // store it in our cache
    bunCache.set(cacheKey, queryResults);
    // store it in pouchDB
    // bunCache.pouchDB.put({
    //   _id: cacheKey,
    //   data: queryResults,
    // });
    return queryResults;
  }
}

const serializeTheProto = (proto) => {
  if (proto && typeof proto === 'object') {
    // sort the keys in the prototype
    const protoKeys = Object.keys(proto).sort();

    return `{${protoKeys
      // map over all of the keys and recursively call each one to handle nested objects
      .map((key) => `"${key}":${serializeTheProto(proto[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(proto);
};

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
