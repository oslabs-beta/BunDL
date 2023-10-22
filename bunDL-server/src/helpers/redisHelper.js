import redisCacheMain from './redisConnection';

// connection to Redis server
const redisCache = redisCacheMain;

const getFromRedis = async (key) => {
  if (typeof key !== 'string') return;
  try {
    const redisResult = await redisCache.json_get(key);
    return redisResult;
  } catch (error) {
    const err = {
      log: `Error in RedisCache trying to getFromRedis, ${error}`,
      status: 400,
      message: {
        err: 'Error in getFromRedis. Check server log for more details.',
      },
    };
    console.log('err in getFromRedis: ', err);
  }
};

const writeToCache = async (key, value, expireTime = null) => {
  try {
    await redisCache.set(key, value);
    console.log('writeToCache value', value);
    // if there is an expire time
    if (expireTime) {
      // set an expire time
      await redisCache.expire(key, expireTime);
    }
    console.log(`Value set to Redis for key: ${key}`);
  } catch (error) {
    const err = {
      log: `Error in RedisCache trying to setToRedis, ${error}`,
      status: 400,
      message: {
        err: 'Error in setToRedis. Check serverlog for more details',
      },
    };
    console.log('Error in setToRedis: ', err);
  }
};

export { getFromRedis, writeToCache }; //writeToCache

export const getRedisInfo = (
  options = {
    // getStats: true,
    getKeys: true,
    getValues: true,
  }
) => {
  console.log('Getting Redis Info');
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
    if (getKeys && !getValues) return 'getKeysOnly';
    // else if (getKeys && !getValues) return "dontGetValues";
    else return 'getKeysAndValues';
  };

  switch (getOptions(options)) {
    // we always need keys here - to get values
    case 'getKeysOnly':
      middleware.push(getRedisKeys);
      break;
    case 'getKeysAndValues':
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
          err: 'Error occurred in getRedisKeys',
        },
      };
      return next(err);
    });
};

/* get values associated with keys from Redis
  @inputs: req res next (express) */
export const getRedisValues = (req, res, next) => {
  console.log('RES.LOCALS.REDISKEYS', res.locals.redisKeys);
  if (res.locals.redisKeys && res.locals.redisKeys.length !== 0) {
    redisCache
      // 'multi-get' method used with Redis to fetch multipel values for a list of keys
      .mget(res.locals.redisKeys)
      .then((response) => {
        console.log('.THEN RESPONSE', response);
        res.locals.redisValues = response;
        return next();
      })
      .catch((error) => {
        const err = {
          log: `error occurred in getRedisvalues, ${error}`,
          status: 400,
          message: {
            err: 'Error in redis = getRedisValues, Check server logs',
          },
        };
        return next(err);
      });
  } else {
    console.log('HITTING ELSE statement');
    res.locals.redisValues = [];
    return next();
  }
};

// export const getRedisMemory = () => {
//   return new Promise((resolve, reject) => {
//     redisCache.info((err, result) => {
//       if (err) {
//         console.error('Error retrieving memory stats:', err);
//         reject(err);
//       } else {
//         const lines = result.split('\r\n'); // Split the result into lines
//         const memoryLine = lines.find((line) =>
//           line.startsWith('used_memory:')
//         );
//         if (memoryLine) {
//           const usedMemoryValue = parseInt(memoryLine.split(':')[1], 10);
//           console.log('Redis Memory Stats: used_memory', usedMemoryValue);
//           resolve(usedMemoryValue);
//         } else {
//           console.error('Memory info not found in the result');
//           reject('Memory info not found in the result');
//         }
//       }
//     });
//   });
// };
