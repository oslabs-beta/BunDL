// importing redisCacheMain ( our redis cache )
//import redisCacheMain from '../server/src/helpers/redisConnection';

// import getFromRedis
import { getFromRedis, writeToCache } from './redisHelper';

const checkCache = async (proto) => {
  // console.log('proto: ', proto);
  //create cache key by stringifying the proto
  let cachedResult;
  const cacheKey = JSON.stringify(proto);
  // console.log(cacheKey);
  // retrieve data from getfromredis passing in cachekey
  const cachedData = await getFromRedis(cacheKey);
  // console.log('cached data: ', cachedData);
  //if cachedData exists
  if (cachedData) {
    //turns result back to object
    cachedResult = JSON.parse(cachedData);
    // console.log('DIRECT CACHE HIT', cachedResult);
    console.log('DIRECT CACHE HIT');
    //return cached result
    return cachedResult;
  }
  // console.log('cacheddata', cachedResult);
};

export default checkCache;

// check keys in proto (fields, frags, operation type)
// for (const keys in proto) {
//   if (keys === fields && operationType !== 'noBuns') {
//     const dataFromCache = await getFromRedis(keys);
//   }
// }
