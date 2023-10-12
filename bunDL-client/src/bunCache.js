import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
import { LRUCache } from 'lru-cache';

export default class BunCache {
  constructor(schema, maxSize = 100) {
    this.schema = schema;
    // Create a new LRU Cache instance

    this.cache = new LRUCache({
      //specifies how many items can be in the cache
      max: maxSize,
    });
    this.query = this.query.bind(this);
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
  has(key) {
    return this.cache.has(key);
  }
  delete(key) {
    this.cache.del(key);
  }
  // clears the entire cache
  clear() {
    this.cache.reset();
  }

  async query(req) {
    // intercept query
    let data;

    try {
      data = await req.json();
      req.body.query = data.query;
    } catch (error) {
      console.error('error parsing request: ', error);
    }

    const query = req.body.query.trim();
    // convert query into an AST
    const AST = parse(query);
    // first grab the proto, and operation type from invoking extractAST on the query
    const { proto, operationType } = extractAST(AST);

    if (operationType === 'noID') {
      const queryResults = await graphql(this.schema, query);
      if (queryResults) {
        return queryResults;
      } else {
        console.log('Error fetching from DB');
        return;
      }
    }

    //create the cache key by simply stringifying the proto
    const cacheKey = JSON.stringify({ proto });
    // check the cache if this key already exists
    if (this.has(cacheKey)) {
      // if the key exists then return the value of that cacheKey
      const queryResults = this.get(cacheKey);
      console.log('retrieved from cache!', queryResults);
      return queryResults;

      // integrate pouch DB logic
    } else {
      // fetch data from the database
      const queryResults = await graphql(this.schema, query);
      //conditional to make sure we got something back from the database
      if (queryResults) {
        // store data into the cache
        console.log('GraphQL Result:', queryResults);
        this.set(cacheKey, queryResults);
        // send data to client
        return queryResults;
      } else {
        //error handler
        console.log('could not fetch from database');
      }
    }
  }
}
