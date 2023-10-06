// assume we have a copy of prototype (a copy of the request in AST format) [ken andrew]
// pass in prototype and prototype keys in cache function
// saves cache response to result of cache function

// for now : ignore the feature that reconstruct query of whats missing in the cache/db
// for now: just return the cache response (result of cache func)

// redis cache does not have unique ids, we need to generate these for keys

// if the query is in the cache

/*
Shi: HELLO THIS IS SHI HIIIII
Shi: ok someone commented out my comment 
Shi: WHO IS IT 
Shi: please respond
Shi: IT WAS M
Shi: //bdoe dBDO
Shi: //bdodecompress i seee
Shi: i have to stay in this lecture, so let me know how i can help

Shi: i dont get what ur saying 
Shi: what language is this ???????????????????????????????????????????

Shi: who is this imposter?
Shi: the Shi we know is busy with a lecture
Shi: Shi: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Shi: im scared gio LOOOL this lady is scaring me 
Shi: im the imposterhe shi i know is an imposter FOR SURE
//Shi: i just typed shit
imposterShi: LOL did you go already?
//Shi:  this is some illiminati shit
// Shi: YEAH I KILLED IT
Gio: we should keep this in our final product
Shi: ^^^ i want everyone to see 
LOOL - shi ... and thats ddef bdo^^^
Shi: BRUHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
Shi: why r u talking to urself shi
Shi: bc im the imposter monster rawr xD
Shi: WOWWWWWW.......

Shi: so hows that query going??naadaaaaaaaaaa i seeeeeeee
Shi: im lost trying to follow cant see the big picture rn 

*/

// //import mongodatabase
// import Spider from '../server-demo/models/spiderModel'
// const querySearch = 'FAKEPROTOTYPE';
// // prototype ^ 
// let redisResult = await getFromRedis(querySearch, this.redisCache);

// // if result from redis exists, then return

// //request: 
// //name: spider1

// if (redisResult) {
//   return redisResult
//   //name
//   //legs
//   //eyes, etc
//   // otherwise if it does not exist, grab from database // save it and send it to redis to set the results as a new cache
//   // redis.set('myKey', 'someValue');
// } else {
  
// }

// const {name} = redisResult;
// Spider.find({name})

// if also not in db - return error

// key: name of the data 
// value: all properties { name , legs , eyes, ect.. }
// example: 
//value: {legs: 4}
//key: spider1.legs

//redis cache
//cache1: name, legs
//cache2: name, eyes, location
//cache3: name, legs, eyes, location

// importing redisCacheMain ( our redis cache )
const redisCacheMain = require('./helpers/redisConnection');

// import getFromRedis 
const getFromRedis = require ('./helpers/redisHelper');

// fetching from cache basic 
// hard coding a 'userID' - queryExample
// const queryExample = '12345';
// const redisResult = await redisCacheMain.get(`name:${queryExample}`);

// // make a resopnse from cache
// const response = await buildCache(proto)
// // let redisResult = await getFromRedis(querySearch, this.redisCache);
// // set redisResult to using native get method on redisCacheMain with the hard coded 'userId' 
// // if redis result exists in cache -> return JSON parsed redisResult
// if (redisResult){
//   // bc redis cache is always strings 
//   return JSON.parse(redisResult);
// } else {
//     // otherwise, returns data from database -- data from db is already formatted to suite us 'readability'
//     const spiderDataFromDB = await getSpiderFromDatabase(queryExample);
//     // extension: store fecthed sterilized data in Redis
//     await redis.set(`name:${queryExample}`, JSON.stringify(spiderDataFromDB));
//     return spiderDataFromDB;
// }

const checkCache = async (proto) => {
  //create cache key by stringifying the proto
  const cacheKey = JSON.stringify(proto)
  // retrieve data from getfromredis passing in cachekey
  const cachedData = await getFromRedis(cacheKey)
  //if cachedData exists
  if (cachedData) {
    //turns result back to object
    const cachedResult = JSON.parse(cachedData);
    console.log('DIRECT CACHE HIT', cachedResult)
    //return cached result
    return cachedResult
  }
  //if cachedData does not exist
  else {
    // check database, -> if it exists in the database -> update our redis cache 
    // worry about if it doesnt exist in the database later
  }





  // check keys in proto (fields, frags, operation type)
  // for (const keys in proto) {
  //   if (keys === fields && operationType !== 'noBuns') {
  //     const dataFromCache = await getFromRedis(keys);
  //   }
  // }

  
}
//Shi: LOOOKING GOOOOOOOOOD
/*
// otherwise update redis cache with native set method 
chad example - of not finding something in redis cache so checking db and setting found data in redis cache
getUserFromDB: hypothetical controller file used 
const userDataFromDB = await getUserFromDatabase(userId);
await redis.set(`user:${userId}`, JSON.stringify(userDataFromDB));
return userDataFromDB;
*/

/*
andrew graphql -> turns into ast
ken: gets the ast -> filters the proto and have conditionals on what to do with ast data
  for example: some things might be no buns (not cachable due to fast update on info - stale data)
us: we take proto to understand what we can get - check redis cache then db to obtain info needed
   need to take proto key and pass it into rediscache as a key (how would redis read proto )

  const proto = {
    fields: {}, // some sort of id or name or alias
    frags: {}, // properties that appear alot so putting it in a fragment helps reduce code
    operation: '', // if its no buns or buns / quellable or unquellable - no buns = not cachable 
    type: null,
  };
*/

/*
*buildFromCache
The method would iterate through proto using the for (const superField in proto) loop.
For each superField, it would:
Check if there's cached data available for that field or fragment.
Construct the response based on the cached data and the requested fields or fragments.
If some data isn't available in the cache, it would mark it (possibly using the provided map or another mechanism) to be fetched directly from the data source.
The combination of fields, frags, operation, and type in the proto provides a comprehensive view of what the GraphQL request is asking for, which the caching mechanism can then use to fetch, construct, or invalidate cached data.

 */