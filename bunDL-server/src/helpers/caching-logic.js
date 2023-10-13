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
    // console.log('DIRECT CACHE HIT', cachedResult);
    console.log('DIRECT CACHE HIT');
    //return cached result
  }
  return cachedResult;
};

export default checkCache;

