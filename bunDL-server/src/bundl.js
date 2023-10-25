import { graphql } from 'graphql';
import interceptQueryAndParse from './helpers/intercept-and-parse-logic';
import extractAST from './helpers/prototype-logic';
import { extractIdFromQuery } from './helpers/queryObjectFunctions';
import redisCacheMain from './helpers/redisConnection';
require('dotenv').config();

const defaultConfig = {
  cacheVariables: false,
  cacheMetadata: false,
  requireArguments: false,
};

export default class BunDL {
  constructor(schema, cacheExpiration, redisPort, redisHost, userConfig) {
    this.config = { ...defaultConfig, ...userConfig };
    this.schema = schema;
    this.cacheExpiration = cacheExpiration;
    this.redisPort = redisPort;
    this.redisHost = redisHost;
    this.redisCache = redisCacheMain;
    this.query = this.query.bind(this);
    this.mergeObjects = this.mergeObjects.bind(this);
    this.handleCacheHit = this.handleCacheHit.bind(this);
    this.handleCacheMiss = this.handleCacheMiss.bind(this);
    this.storeDocuments = this.storeDocuments.bind(this);
    this.insertRedisKey = this.insertRedisKey.bind(this);
  }

  // Initialize your class properties here using the parameters

  async query(request) {
    try {
      const data = await request.json();
      request.body.query = data.query;
      const redisKey = extractIdFromQuery(request.body.query);
      console.log(redisKey);
      const start = performance.now();
      const { AST, sanitizedQuery, variableValues } =
        await interceptQueryAndParse(request.body.query);
      const obj = extractAST(AST, this.config, variableValues);
      const { proto, operationType } = obj;
      // ! "Get All Keeps getting Sent to No Buns"
      if (operationType === 'noBuns') {
        console.log('1');
        const queryResults = await graphql(this.schema, sanitizedQuery);
        return queryResults;
      } else {
        console.log('2');
        let redisData = await this.redisCache.json_get(redisKey);
        if (redisData) {
          console.log('3');
          return this.handleCacheHit(proto, redisData, start);
        } else if (!redisKey) {
          console.log('4');
          const queryResults = await graphql(this.schema, sanitizedQuery);
          console.error(queryResults);
          const stored = this.storeDocuments(queryResults.data.users);
          return queryResults;
        } else {
          console.log('5');
          return this.handleCacheMiss(proto, start, redisKey);
        }
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      return {
        log: error.message,
        status: 400,
        message: { err: 'GraphQL query Error' },
      };
    }
  }

  handleCacheHit(proto, redisData, start) {
    const end = performance.now();
    const speed = end - start;
    console.log('🐇 Data retrieved from Redis Cache 🐇');
    console.log('🐇 cachespeed', speed, ' 🐇');
    const cachedata = { cache: 'hit', speed: end - start };
    const returnObj = { ...proto.fields };
    for (const field in returnObj.user) {
      returnObj.user[field] = redisData.user[field];
    }
    console.log('RedisData retrieved this: ', returnObj);
    return { returnObj, cachedata };
  }

  async handleCacheMiss(proto, start, redisKey) {
    console.log('no cache');
    const fullDocQuery = this.insertRedisKey(process.env.QUERY, redisKey);
    const fullDocData = (await graphql(this.schema, fullDocQuery)).data;
    await this.redisCache.json_set(redisKey, '$', fullDocData);
    console.log('🐢 Data retrieved from GraphQL Query 🐢');
    const returnObj = { ...proto.fields };
    console.log(returnObj);
    console.log(fullDocData);
    for (const field in returnObj.user) {
      returnObj.user[field] = fullDocData.user[field];
    }
    const end = performance.now();
    const speed = end - start;
    console.log('🐢 Data retrieved without Cache Results', speed, ' 🐢');
    const cachedata = { cache: 'miss', speed: end - start };
    return { returnObj, cachedata };
  }

  clearRedisCache(request) {
    console.log('Redis cache cleared!!');
    this.redisCache.flushall();
    return;
  }

  mergeObjects(templateObj, data, mergeObject) {
    // Split recursive call into helper function
    const performMerge = (tempObj, dataObj, mergeObj) => {
      for (const key in mergeObj) {
        if (Object.prototype.hasOwnProperty.call(mergeObj, key)) {
          if (dataObj[key] !== undefined) {
            if (typeof dataObj[key] === 'object' && dataObj[key] !== null) {
              mergeObj[key] = performMerge(
                tempObj[key],
                dataObj[key],
                mergeObj[key] || {}
              );
            } else {
              mergeObj[key] = dataObj[key];
            }
          }
        }
      }
      return mergeObj;
    };
    const result = performMerge(templateObj, data, mergeObject);
    console.log("Here's your merged document: ", result);
    return result;
  }

  storeDocuments(array) {
    array.forEach((document) => {
      this.redisCache.json_set(document.id, '$', { user: document });
    });
  }

  insertRedisKey(query, redisKey) {
    const index = query.indexOf('id:'); // Find the index of "id:"
    if (index === -1) {
      throw new Error('Query string does not contain "id:"');
    }
    const before = query.substring(0, index + 4); // Extract the substring before and including "id:"
    const after = query.substring(index + 4); // Extract the substring after "id:"
    return `${before}"${redisKey}"${after}`; // Insert the redisKey in between
  }

  // partial queries:
  // if user is querying the same id: but some of the wanted values are null ->
  // iterate through the object -

  // * This is the closing bracket for the whole class!
}
