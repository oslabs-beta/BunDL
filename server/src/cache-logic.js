// importing redisCacheMain ( our redis cache )
const redisCacheMain = require('./helpers/redisConnection');

// import getFromRedis
const getFromRedis = require('./helpers/redisHelper');

const checkCache = async (proto) => {
  //create cache key by stringifying the proto
  const cacheKey = JSON.stringify(proto);
  // retrieve data from getfromredis passing in cachekey
  const cachedData = await getFromRedis(cacheKey);
  //if cachedData exists
  if (cachedData) {
    //turns result back to object
    const cachedResult = JSON.parse(cachedData);
    console.log('DIRECT CACHE HIT', cachedResult);
    //return cached result
    return cachedResult;
  }
  //if cachedData does not exist
  //else {
  // check database, -> if it exists in the database -> update our redis cache
  // worry about if it doesnt exist in the database later
  //}
};

export default checkCache;

// check keys in proto (fields, frags, operation type)
// for (const keys in proto) {
//   if (keys === fields && operationType !== 'noBuns') {
//     const dataFromCache = await getFromRedis(keys);
//   }
// }