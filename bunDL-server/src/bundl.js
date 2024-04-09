import { graphql } from 'graphql';
import interceptQueryAndParse from './helpers/intercept-and-parse-logic';
import extractAST from './helpers/prototype-logic';
import { extractIdFromQuery } from './helpers/queryObjectFunctions';
import redisCacheMain from './helpers/redisConnection';

const defaultConfig = {
  cacheVariables: true,
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
    this.deepAssign = this.deepAssign.bind(this);
  }

  // Initialize your class properties here using the parameters

  async query(request) {
    try {
      const data = await request.json();
      request.body.query = data.query;
      const redisKey = extractIdFromQuery(request.body.query);
      const start = performance.now();
      const { sanitizedQuery } = await interceptQueryAndParse(request.body.query);
      const queryHash = this.generateQueryHash(sanitizedQuery);
      const cachedResult = await this.getCachedQueryResult(queryHash);

      if (cachedResult) {
        console.log('Results found in cache');
        return cachedResult;
      } else {
        console.log('Results not found in cache');
        const { AST, variableValues } = await interceptQueryAndParse(request.body.query);
        const obj = extractAST(AST, this.config, variableValues);
        const { proto, operationType, operationMutation } = obj;
        let queryResults;

        if (operationMutation) {
          queryResults = await graphql(this.schema, sanitizedQuery);
          this.clearRedisCache();
        } else {
          queryResults = await graphql(this.schema, sanitizedQuery);
        }

        await this.storeDocuments(sanitizedQuery, queryResults);
        return queryResults;
      }
    } catch (error) {
      console.error('GraphQL Error: ', error);
      return {
        log: error.message,
        status: 400,
        message: { err: 'GraphQL query error' },
      };
    }
  }

  /**
   * Merges specified fields from a source object into a target object, recursively handling nested objects.
   * Only the fields that are specified in the target object will be merged from the source object.
   * @param {Object} proto - The object specifying the structure and fields to be merged from redisData.
   * @param {Object} redisData - The source object from which data will be merged.
   * @returns {Object} - The resultant object after merging specified fields from redisData.
   */
  handleCacheHit(proto, redisData, start) {
    const end = performance.now();
    const speed = end - start;
    console.log('🐇 Data retrieved from Redis Cache 🐇');
    console.log('🐇 cachespeed', speed, ' 🐇');
    const cachedata = { cache: 'hit', speed: end - start };
    const returnObj = this.deepAssign({ ...proto.fields }, redisData);
    return { returnObj, cachedata };
  }

  /**
   * Recursively merges properties from the source object into the target object, but only if they are specified in the target object.
   * @param {Object} target - The object into which properties will be merged.
   * @param {Object} source - The object from which properties will be merged.
   * @returns {Object} - The target object after merging.
   */
  deepAssign(target, source) {
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        if (Object.prototype.toString.call(target[key]) === '[object Object]' && Object.prototype.toString.call(source[key]) === '[object Object]') {
          target[key] = this.deepAssign(target[key], source[key]);
        } else if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  async handleCacheMiss(proto, start, redisKey) {
    console.log('no cache');
    console.log(Bun.env.QUERY);
    const fullDocQuery = this.insertRedisKey(process.env.QUERY, redisKey);
    console.log('fulldocquery: ', fullDocQuery);
    const fullDocData = (await graphql(this.schema, fullDocQuery)).data;
    console.log('fulldocData', fullDocData);
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
              mergeObj[key] = performMerge(tempObj[key], dataObj[key], mergeObj[key] || {});
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
    console.log('this is store doc array', array);
    array.forEach((document) => {
      this.redisCache.json_set(document.id, '$', { document });
    });
  }

  insertRedisKey(query, redisKey) {
    console.log('query: ', query);
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
