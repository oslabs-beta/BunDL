// import Redis from 'ioredis';
import RedisReJSON from 'ioredis-rejson';
// import Redis from 'ioredis-rejson';

const redisPort = Number(process.env.REDIS_PORT);
const redisHost = process.env.REDIS_HOST;
const redisPassword = process.env.REDIS_PASSWORD;

const redisCacheMain = new RedisReJSON({
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

export default redisCacheMain;
