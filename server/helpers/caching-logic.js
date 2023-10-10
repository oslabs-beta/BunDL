// importing redisCacheMain ( our redis cache )
//import redisCacheMain from '../server/src/helpers/redisConnection';

// import getFromRedis
import { getFromRedis, writeToCache } from './redisHelper';

const checkCache = async (proto) => {
  //create cache key by stringifying the proto
  let cachedResult;
  const cacheKey = JSON.stringify(proto);
  // retrieve data from getfromredis passing in cachekey
  const cachedData = await getFromRedis(cacheKey);
  //if cachedData exists
  if (cachedData) {
    //turns result back to object
    cachedResult = JSON.parse(cachedData);
    console.log('DIRECT CACHE HIT', cachedResult);
    //return cached result
  }
  console.log('cacheddata', cachedData);

  return cachedResult;
};

export default checkCache;

// check keys in proto (fields, frags, operation type)
// for (const keys in proto) {
//   if (keys === fields && operationType !== 'noBuns') {
//     const dataFromCache = await getFromRedis(keys);
//   }
// }
