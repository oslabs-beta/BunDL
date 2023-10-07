import Redis from 'ioredis';

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

