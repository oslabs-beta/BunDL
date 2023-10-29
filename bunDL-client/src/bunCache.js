import { parse } from 'graphql';
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
};

export default class BunDL {
  constructor(maxSize = 100, userConfig = {}) {
    this.config = { ...defaultConfig, ...userConfig };
    // Create a new LRU Cache instance
    this.cache = new LRUCache({
      //specifies how many items can be in the cache
      max: maxSize,
    });
    this.pouchDB = db;
    this.clientQuery = this.query.bind(this);
    this.fetchFromGraphQL = this.fetchFromGraphQL.bind(this);
  }

  async query(endPoint, query) {
    if (!query) {
      throw new Error('Query is undefined or empty: ', query);
    }

    const start = performance.now();
    let end;
    let speed;
    const AST = parse(query);
    const { proto, operationType } = extractAST(AST, this.config);

    if (proto.operation === 'mutation') {
      this.cache.clear();
      const mutationResults = await this.fetchFromGraphQL(query);
      return mutationResults;
    }

    if (operationType === 'noBuns' || operationType === 'noArguments') {
      const queryResults = await this.fetchFromGraphQL(endPoint, query); //
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

    // if missing cache keys array has items, meaning LRU cache does not have all requested kery
    if (missingCacheKeys.length > 0) {
      //if pouch has some or any of missing cache keys

      const { updatedgraphQLcachedata, missingPouchCacheKeys } =
        await generateMissingPouchDBCachekeys(missingCacheKeys, graphQLcachedata, this.pouchDB);

      if (!missingPouchCacheKeys.length) {
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

        const { returnObj, cachedata } = await this.fetchFromGraphQL(endPoint, graphQLquery);

        //update cachekeys from queryResults
        const updatedCacheKeys = updateMissingCache(returnObj, missingPouchCacheKeys);

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
  async fetchFromGraphQL(endPoint, query) {
    try {
      const response = await fetch(endPoint, {
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
