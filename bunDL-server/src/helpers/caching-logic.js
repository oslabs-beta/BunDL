import { getFromRedis, writeToCache } from './redisHelper';

const checkCache = async (redisKey) => {
  //create cache key by stringifying the proto
  let cachedResult;

  // retrieve data from getfromredis passing in cachekey
  const cachedData = await getFromRedis(redisKey);

  //if cachedData exists
  if (cachedData) {
    //turns result back to object
    cachedResult = JSON.parse(cachedData);

    //return cached result
  }
  return cachedResult;
};

export default checkCache;

// check redis cache for current key we want
//
