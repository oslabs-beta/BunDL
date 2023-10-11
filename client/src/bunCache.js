import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
import Database from './helpers/pouchHelpers.js';

export default class BunCache {
  constructor(
    schema,
    maxSize = 100,
    database,
    databaseName,
    databaseOptions = {}
  ) {
    this.schema = schema;
    this.mapCache = new Map();
    this.maxSize = maxSize;
    this.fetch = this.fetch.bind(this);
    this.database = database || new Database(databaseName, databaseOptions);
  }
  // method to set a key value pair into our map cache
  set(key, value) {
    const entry = {
      data: value,
      timeStamp: Date.now(),
    };
    this.mapCache.set(key, entry);
    this.checkEviction();
  }
  // method to retrieve the VALUE of a given key
  get(key) {
    const entry = this.mapCache.get(key);
    return entry ? entry.data : undefined;
  }
  // method to check if a key is in the cache
  has(key) {
    return this.mapCache.has(key);
  }
  // method to delete a key
  delete(key) {
    this.mapCache.delete(key);
  }
  // method to clear the cache
  clear() {
    this.mapCache.clear();
  }
  // method to check if our cache has exceeded its maximum size (if it is it will delete the oldest key)
  checkEviction() {
    while (this.mapCache.size > this.maxSize) {
      const oldestKey = this.mapCache.keys().next().value;
      this.mapCache.delete(oldestKey);
    }
  }
  async fetch(req, res, next) {
    // intercept query
    const query = req.body.query;
    // convert query into an AST
    const AST = parse(query);
    // first grab the proto, and operation type from invoking extractAST on the query
    const { proto, operationType } = extractAST(AST);
    //create the cache key by simply stringifying the proto
    const cacheKey = JSON.stringify({ proto });
    // check the cache if this key already exists
    if (this.has(cacheKey)) {
      // if the key exists then return the value of that cacheKey
      res.locals.queryResults = this.get(cacheKey);
      console.log('retrieved from cache!', res.locals.queryResults);
      return next();

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
        res.locals.queryResults = queryResults;
        return next();
      } else {
        //error handler
        console.log('could not fetch from database');
      }
    }
  }
}
