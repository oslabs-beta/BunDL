const Redis = require('ioredis');
/* 
  import { RedisClientType } from "redis";
  import { createClient } from "redis";
  const Redis = require ('redis');
  const dotenv = require("dotenv");
  dotenv.config();

Where do we store the REDIS_HOST & REDIS_PASSWORD? Do we need a bun.env folder? 
*/

// const redisPort = Number(bun.env.REDIS_PORT);
// const redisHost = bun.env.REDIS_HOST;
// const redisPassword = bun.env.REDIS_PASSWORD;

// manually set port and host for now
const redisPort = 6379;
const redisHost = '127.0.0.1';



const redisCacheMain = new Redis({
  host: redisHost,
  port: redisPort,
  // password: redisPassword,
});

redisCacheMain.on('error', (error) => {
  console.error(`Error when trying to connect to redisCacheMain: ${error}`);
});

redisCacheMain.on('connect', () => {
  console.log('Connected to redisCacheMain');
});


modeul.exports = redisCacheMain;

