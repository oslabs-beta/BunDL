// import { redisCacheMain } from './redisConnection';
// import { Response, Request, NextFunction, RequestHandler } from "express";
const express = require('express');
const redisCacheMain = require('./redisConnection');

// connection to Redis server
const redisCache = redisCacheMain;


const getFromRedis = async (key, redisCache) => {
    try {
      if (typeof key !== "string" || key === undefined) return;
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
    }
  };