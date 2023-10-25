import { graphql } from 'graphql';
import interceptQueryAndParse from './helpers/intercept-and-parse-logic';
import extractAST from './helpers/prototype-logic';
import { extractIdFromQuery } from './helpers/queryObjectFunctions';
import redisCacheMain from './helpers/redisConnection';

const defaultConfig = {
  cacheVariables: true,
  cacheMetadata: false,
  requireArguments: true,
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
  }

  // Initialize your class properties here using the parameters

  async query(request) {
    try {
      const data = await request.json();
      request.body.query = data.query;
      const redisKey = extractIdFromQuery(request.body.query);
      // console.log(redisKey);
      const start = performance.now();
      const { AST, sanitizedQuery, variableValues } =
        await interceptQueryAndParse(request.body.query);
      const obj = extractAST(AST, this.config, variableValues);
      const { proto, operationType } = obj;
      // if (operationType === 'query') {
      //   const queryResults = await graphql(this.schema, sanitizedQuery);
      //   return queryResults;
      // }
      if (operationType === 'noBuns') {
        const queryResults = await graphql(this.schema, sanitizedQuery);
        return queryResults;
      } else {
        let redisData = await this.redisCache.json_get(redisKey);
        console.log('redisdata', redisData);
        if (redisData) {
          return this.handleCacheHit(proto, redisData, start);
        } else if (!redisKey) {
          const queryResults = await graphql(this.schema, sanitizedQuery);
          this.storeDocuments(queryResults.data.users);
          return queryResults;
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

    const fieldType = Object.keys(redisData)[0];

    for (const field in returnObj[fieldType]) {
      returnObj[fieldType][field] = redisData[fieldType][field];
    }
    console.log('RedisData retrieved this: ', returnObj);
    return { returnObj, cachedata };
  }

  async handleCacheMiss(proto, start, redisKey) {
    console.log('no cache');
    const fullDocQuery = `{
      company (id: "${redisKey}") {
        id
        state
        city
        company
        department (id: "department1") {
         departmentName
          }
        }
      }`;

    //`
    //     {
    //       user(id: "${redisKey}") {
    //         id
    //         firstName
    //         lastName
    //         email
    //         phoneNumber
    //         address {
    //           street
    //           city
    //           state
    //           zip
    //           country
    //         }
    //       }
    //     }
    //`;
    let fullDocData = await graphql(this.schema, fullDocQuery);
    fullDocData = fullDocData.data;
    await this.redisCache.json_set(redisKey, '$', fullDocData);
    console.log('🐢 Data retrieved from GraphQL Query 🐢');
    const returnObj = { ...proto.fields };
    const fieldType = Object.keys(fullDocData)[0];
    for (const field in returnObj[fieldType]) {
      returnObj[fieldType][field] = fullDocData[fieldType][field];
    }
    console.log('fullDocData: ', fullDocData);
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
  // partial queries:
  // if user is querying the same id: but some of the wanted values are null ->
  // iterate through the object -

  // * This is the closing bracket for the whole class!
}
