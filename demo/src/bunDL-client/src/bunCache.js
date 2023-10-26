import { parse, graphql } from 'graphql';
import extractAST from './helpers/extractAST.js';
import generateCacheKeys from './helpers/cacheKeys';
import { db } from './helpers/pouchHelpers.js';
import { LRUCache } from 'lru-cache';
import {
  generateGraphQLQuery,
  generateMissingLRUCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
  generateMissingPouchDBCachekeys,
} from './helpers/queryHelpers.js';

const defaultConfig = {
  cacheMetadata: false,
  cacheVariables: true,
  requireArguments: true,
  cacheSize: 100,
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
    this.pouchDB = db;
    this.clientQuery = this.query.bind(this);
    this.fetchFromGraphQL = this.fetchFromGraphQL.bind(this);
  }

  async query(query) {
    const start = performance.now();
    let end;
    let speed;
    const AST = parse(query);
    const { proto, operationType } = extractAST(AST, this.config);
    console.log('proto: ', proto);
    console.log('ast operationtype', operationType);

    if (operationType === 'noArguments') {
      const queryResults = await this.fetchFromGraphQL(query); //
      end = performance.now();
      let cachedata = { cache: 'hit', speed: end - start };
      if (queryResults) {
        return { queryResults, cachedata };
      }
    }

    //create the cache keys
    const cacheKeys = generateCacheKeys(proto);

    // check the LRU cache if this key already exists
    const { missingCacheKeys, graphQLcachedata } = generateMissingLRUCachekeys(
      cacheKeys,
      this.cache
    );

    console.log('LRU missing', missingCacheKeys);
    console.log('LRU graphql', graphQLcachedata);

    // if missing cache keys array has items, meaning LRU cache does not have all requested kery
    if (missingCacheKeys.length > 0) {
      //if pouch has some or any of missing cache keys

      const { updatedgraphQLcachedata, missingPouchCacheKeys } =
        await generateMissingPouchDBCachekeys(missingCacheKeys, graphQLcachedata, this.pouchDB);

      console.log('missingpouch', missingPouchCacheKeys);

      if (!missingPouchCacheKeys.length) {
        console.log('no more missing');
        const updatedCacheKeys = updateMissingCache(updatedgraphQLcachedata, missingCacheKeys);

        for (const keys in updatedCacheKeys) {
          this.cache.set(keys, updatedCacheKeys[keys]);
        }
        end = performance.now();
        speed = end - start;
        let cachedata = { cache: 'hit', speed: speed };
        return { updatedgraphQLcachedata, cachedata };
      } else {
        const graphQLquery = generateGraphQLQuery(missingPouchCacheKeys);
        console.log('query', graphQLquery);
        const { returnObj, cachedata } = await this.fetchFromGraphQL(graphQLquery);

        console.log('queryresults', returnObj);

        //update cachekeys from queryResults
        const updatedCacheKeys = updateMissingCache(returnObj, missingPouchCacheKeys);
        console.log('updatedcachekeys', updatedCacheKeys);

        //update lru cache with queryresults
        for (const keys in updatedCacheKeys) {
          this.cache.set(keys, updatedCacheKeys[keys]);
        }

        //generate graphQL response from cache and merge response
        const newgraphql = mergeGraphQLresponses(updatedgraphQLcachedata, returnObj);
        return { newgraphql, cachedata };
      }
    }
    end = performance.now();
    speed = end - start;
    let cachedata = { cache: 'hit', speed: speed };
    return { graphQLcachedata, cachedata };
  }
  async fetchFromGraphQL(query) {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query: query }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error during fetch:', error);
      throw error;
    }
  }
}
