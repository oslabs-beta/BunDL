/**
 * Merges specified fields from a source object into a target object, recursively handling nested objects.
 * Only the fields that are specified in the target object will be merged from the source object.
 * @param {Object} proto - The object specifying the structure and fields to be merged from redisData.
 * @param {Object} redisData - The source object from which data will be merged.
 * @returns {Object} - The resultant object after merging specified fields from redisData.
 */
function handleCacheHit(proto, redisData, start) {
  const end = performance.now();
  const speed = end - start;
  console.log('🐇 Data retrieved from Redis Cache 🐇');
  console.log('🐇 cachespeed', speed, ' 🐇');
  const cachedata = { cache: 'hit', speed: end - start };

  const returnObj = deepAssign({ ...proto.fields }, redisData);
  return { returnObj, cachedata };
}

/**
 * Recursively merges properties from the source object into the target object, but only if they are specified in the target object.
 * @param {Object} target - The object into which properties will be merged.
 * @param {Object} source - The object from which properties will be merged.
 * @returns {Object} - The target object after merging.
 */
const deepAssign = (target, source) => {
  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      if (
        Object.prototype.toString.call(target[key]) === '[object Object]' &&
        Object.prototype.toString.call(source[key]) === '[object Object]'
      ) {
        target[key] = deepAssign(target[key], source[key]);
      } else if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
