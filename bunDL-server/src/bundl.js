import { graphql } from 'graphql';
import interceptQueryAndParse from './helpers/intercept-and-parse-logic';
import extractAST from './helpers/prototype-logic';
import { extractIdFromQuery } from './helpers/queryObjectFunctions';
import redisCacheMain from './helpers/redisConnection';

export default class BunDL {
  constructor(schema, cacheExpiration, redisPort, redisHost) {
    this.schema = schema;
    this.cacheExpiration = cacheExpiration;
    this.redisPort = redisPort;
    this.redisHost = redisHost;
    this.redisCache = redisCacheMain;
    this.query = this.query.bind(this);
    this.redisGetWithKey = this.redisGetWithKey.bind(this);
    this.mergeObjects = this.mergeObjects.bind(this);
    this.template = {
      user: {
        id: null,
        firstName: null,
        lastName: null,
        email: null,
        phoneNumber: null,
        address: {
          street: null,
          city: null,
          state: null,
          zip: null,
          country: null,
        },
      },
    };
  }

  // Initialize your class properties here using the parameters

  async query(request) {
    console.log('🌭🍔🍞🥟');
    const redisKey = extractIdFromQuery(request);
    console.log(request);
    const start = performance.now();
    const { AST, sanitizedQuery, variableValues } =
      await interceptQueryAndParse(request);
    const obj = extractAST(AST, variableValues);
    const { proto, operationType } = obj;
    let results = await this.redisGetWithKey(redisKey);

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
          // graphql expects a query string and not the obj
          const queriedResults = await graphql(this.schema, sanitizedQuery);
          const merged = this.mergeObjects(this.template, queriedResults.data);
          // this.results = Object.assign({}, this.results, { ...queriedResults });
          // const stringifyProto = JSON.stringify(proto);
          // await writeToCache(redisKey, JSON.stringify(results));
          // await writeToCache(redisKey, results);
          await this.redisCache.json_set(redisKey, '$', merged);
          const end = performance.now();
          const speed = end - start;
          console.log('speed end with no cache', speed);
          const cachedata = { cache: 'miss', speed: end - start };
          return { merged, cachedata };
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

  async redisGetWithKey(key) {
    const response = await this.redisCache.json_get(key);
    return response;
  }

  clearRedisCache(request) {
    console.log('Redis cache cleared!!');
    this.redisCache.flushall();
    return;
  }

  mergeObjects(templateObj, data) {
    const mergeObject = { ...templateObj };
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (typeof data[key] === 'object' && data[key] !== null) {
          mergeObject[key] = this.mergeObjects(templateObj[key], data[key]);
        } else {
          mergeObject[key] = data[key];
        }
      }
    }
    return mergeObject;
  }
  // partial queries:
  // if user is querying the same id: but some of the wanted values are null ->
  // iterate through the object -
}
