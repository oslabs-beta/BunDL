import { graphql, GraphQLSchema } from 'graphql';
import interceptQueryAndParse from './helpers/intercept-and-parse-logic';
import extractAST from './helpers/prototype-logic';
import checkCache from './helpers/caching-logic';
import { writeToCache } from './helpers/redisHelper';
import { extractIdFromQuery } from './helpers/queryObjectFunctions';
import storeResultsInPouchDB from './helpers/pouchdbHelpers';
import redisCacheMain from './helpers/redisConnection';
import RedisReJSON from 'ioredis-rejson';
import Redis from 'ioredis-rejson';

export default class BunDL {
  constructor(schema, cacheExpiration, redisPort, redisHost) {
    this.schema = schema;
    this.cacheExpiration = cacheExpiration;
    this.redisPort = redisPort;
    this.redisHost = redisHost;
    this.redisCache = redisCacheMain;
    this.query = this.query.bind(this);
    this.redisGetWithKey = this.redisGetWithKey.bind(this);
  }

  // Initialize your class properties here using the parameters

  async query(request) {
    console.log('🌭🍔🍞🥟');
    const redisKey = [extractIdFromQuery(request)];
    const start = performance.now();
    const { AST, sanitizedQuery, variableValues } =
      await interceptQueryAndParse(request);
    const obj = extractAST(AST, variableValues);
    const { proto, operationType } = obj;
    //const key = generatecachekeys(proto)
    //const result = checkcache(key)
    const redisResults = await this.redisGetWithKey(redisKey);
    console.log(redisResults);
    let results = await checkCache(proto);

    try {
      if (operationType === 'noBuns') {
        const queryResults = await graphql(this.schema, sanitizedQuery);
        return queryResults;

        if (operationType === 'mutation') {
        }
      } else {
        if (results) {
          console.log('cache exists');
          const end = performance.now();
          const speed = end - start;
          console.log('cachespeed', speed);
          const cachedata = { cache: 'hit', speed: end - start };
          return { results, cachedata };
        } else {
          console.log('no cache');
          // console.log('it hits graphql');
          // graphql expects a query string and not the obj
          results = await graphql(this.schema, sanitizedQuery);
          const stringifyProto = JSON.stringify(proto);
          await writeToCache(stringifyProto, JSON.stringify(results));
          const end = performance.now();
          const speed = end - start;
          console.log('speed end with no cache', speed);
          const cachedata = { cache: 'miss', speed: end - start };
          return { results, cachedata };
        }
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      const err = {
        log: error.message,
        status: 400,
        message: {
          err: 'GraphQL query Error',
        },
      };
      return err;
    }
  }

  async redisGetWithKey(keyArray) {
    const redisData = {};
    for (const key of keyArray) {
      redisData[key] = await this.redisCache.json_get(key);
    }
    return redisData;
  }

  clearRedisCache(request) {
    console.log('Redis cache cleared!!');
    this.redisCache.flushall();
    return;
  }
}
