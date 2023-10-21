import { graphql } from 'graphql';
import interceptQueryAndParse from './helpers/intercept-and-parse-logic';
import extractAST from './helpers/prototype-logic';
import {
  extractIdFromQuery,
  convertGraphQLQueryToObject,
} from './helpers/queryObjectFunctions';
import redisCacheMain from './helpers/redisConnection';
import { sanitizeFilter } from 'mongoose';
import { LineController } from 'chart.js';

const { parse } = require('graphql');
export default class BunDL {
  constructor(schema, cacheExpiration, redisPort, redisHost) {
    this.schema = schema;
    this.cacheExpiration = cacheExpiration;
    this.redisPort = redisPort;
    this.redisHost = redisHost;
    this.redisCache = redisCacheMain;
    this.query = this.query.bind(this);
    this.mergeObjects = this.mergeObjects.bind(this);
    this.handleCacheHit = this.handleCacheHit.bind(this);
    this.handleCacheMiss = this.handleCacheMiss.bind(this);
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
    try {
      const redisKey = extractIdFromQuery(request);
      console.log(redisKey);
      const start = performance.now();
      const { AST, sanitizedQuery, variableValues } =
        await interceptQueryAndParse(request);
      const obj = extractAST(AST, variableValues);
      const { proto, operationType } = obj;
      console.log('proto is: ', proto);
      // let results = await this.redisGetWithKey(redisKey);
      let redisData = await this.redisCache.json_get(redisKey);
      if (operationType === 'noBuns') {
        const queryResults = await graphql(this.schema, sanitizedQuery);
        return queryResults;
      }
      if (operationType === 'mutation') {
        // todo: what happens for mutation?
      } else {
        if (redisData) {
          return this.handleCacheHit(redisData, start);
        } else {
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
      returnObj.user[field] = redisData.data.user[field];
    }
    console.log('RedisData retrieved this: ', returnObj);
    return { returnObj, cachedata };
  }

  async handleCacheMiss(proto, start, redisKey) {
    console.log('no cache');
    const fullDocQuery = `
        {
          user(id: "${redisKey}") {
            id
            firstName
            lastName
            email
            phoneNumber
            address {
              street                  
              city
              state
              zip
              country
            }
          }
        }
        `;
    const fullDocData = await graphql(this.schema, fullDocQuery);
    await this.redisCache.json_set(redisKey, '$', fullDocData.data);
    // const cachedData = fullDocData.data;
    console.log('🐢 Data retrieved from GraphQL Query 🐢');
    const returnObj = { ...proto.fields };
    for (const field in returnObj.user) {
      returnObj.user[field] = fullDocData.data.user[field];
    }
    console.log('returnObj', returnObj);
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
  /**
 *   mergeObjects(templateObj, data, originalQuery) {
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
 * 
 */

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

  // convertGraphQLQueryToObject(queryString, redisKey) {
  //   if (typeof queryString !== 'string') {
  //     console.error('querystring should be a string', queryString);
  //     return;
  //   }
  //   // Replace newlines and multiple spaces with single spaces
  // const cleanedQuery = queryString.replace(/\s+/g, ' ').split(' ');
  //   console.log(cleanedQuery);
  //   // Prepare object
  //   // const queryObject = {
  //   //   user: {
  //   //     id: redisKey,
  //   //     fields: {
  //   //       id: null,
  //   //       firstName: null,
  //   //       lastName: null,
  //   //       email: null,
  //   //       phoneNumber: null,
  //   //       address: {
  //   //         street: null,
  //   //         city: null,
  //   //         state: null,
  //   //         zip: null,
  //   //         country: null,
  //   //       },
  //   //     },
  //   //   },
  //   // };
  //   const queryObject = {};

  //   for (const el of cleanedQuery) {
  //     if (el === '{' || el === '}') continue;
  //     queryObject[el] = null;
  //   }

  //   console.log(queryObject);
  //   // You can add more logic here to extract more details from the query string
  //   // if your use-case requires it.

  //   return queryObject;
  // }

  // partial queries:
  // if user is querying the same id: but some of the wanted values are null ->
  // iterate through the object -

  // * This is the closing bracket for the whole class!
}
