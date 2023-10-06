// import { redisCacheMain } from './redisConnection';
// import { Response, Request, NextFunction, RequestHandler } from "express";
const express = require('express');
const redisCacheMain = require('./redisConnection');

// connection to Redis server
const redisCache = redisCacheMain;

/*
  read from Redis cache and returns a promise
    @input: key for Redis lookup
    @output: promise representing value from redis cache 
*/
export const getFromRedis = async (key, redisCache) => {
    try {
      if (typeof key !== "string") return;
      const lowerKey = key.toLowerCase();
      const redisResult = await redisCache.get(lowerKey);
      return redisResult;
    } catch (error) {
      const err = {
        log: `Error in RedisCache trying to getFromRedis, ${error}`,
        status: 400,
        message: {
          err: "Error in getFromRedis. Check server log for more details.",
        },
      };
      console.log("err in getFromRedis: ", err);
      // throw err;
    }
  };

  /* 
  returns a chain of middleware depending on what information users
  want to request from the specified redisCache. Requires an successfully
  configured experss route and saves the stats to res.locals
      example:
      app.use('/route', getRedisInfo ({
        getStats:true,
        getKeys: true,
        getValues: true
      }))
    @input: object (options)
    @output: array
  */

  export const getRedisInfo = (options = {
    // getStats: true,
    getKeys: true,
    getValues: true,
  }) => {
    console.log("Getting Redis Info");
    const middleware = [];
    // console.log('HERE',middleware)

    /*
    helper function within getRedisInfo that returns what data from redis is available
    and retrievable based on the passed in keys and values (options)
    
    @input: object (opts) (boolean value for key and values)
    @output: string (which data to retrieve)
    */
    const getOptions = (opts) => {
      const { getKeys, getValues } = opts;
      if (getKeys && !getValues) return "getKeysOnly";
      // else if (getKeys && !getValues) return "dontGetValues";
      else return "getKeysAndValues"
    };
    
    switch (getOptions(options)) {
      // we always need keys here - to get values
      case "getKeysOnly" :
        middleware.push(getRedisKeys);
        break;
      case "getKeysAndValues" :
        middleware.push(getRedisKeys, getRedisValues);
        break;
    }
    // console.log(middleware);
    return middleware;
  };

  /* get key names from Redis -> add to response
  @inputs: req res next (express) */
  export const getRedisKeys = (req, res, next) => {
    redisCache
      .keys('*')
      .then((response) => {
        res.locals.redisKeys = response;
        return next();
      })
      .catch((error) => {
        const err = {
          log: `Error occurred in getRedisKeys function: ${error}`,
          status: 400,
          message: {
            err: "Error occurred in getRedisKeys"
          }
        };
        return next(err);
      });
  };

  /* get values associated with keys from Redis
  @inputs: req res next (express) */
  export const getRedisValues = (req, res, next) => {
    console.log('RES.LOCALS.REDISKEYS', res.locals.redisKeys)
    if (res.locals.redisKeys && res.locals.redisKeys.length !== 0) {
      redisCache
      // 'multi-get' method used with Redis to fetch multipel values for a list of keys
        .mget(res.locals.redisKeys)
        .then(response => {
          console.log('.THEN RESPONSE', response)
          res.locals.redisValues = response;
          return next();
        })
        .catch(error => {
          const err = {
            log: `error occurred in getRedisvalues, ${error}`,
            status: 400,
            message: {
              err: "Error in redis = getRedisValues, Check server logs"
            }, 
          };
          return next(err);
        });
    } else {
      console.log('HITTING ELSE statement')
      res.locals.redisValues = [];
      return next(); 
    }
  };