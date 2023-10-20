// this function is designed to segment a single proto into multiple keys
const generateCacheKeys = (proto) => {
  // this serves as the base for all the keys
  const base = `${proto.operation}`;

  const traverseFields = (fields, path) => {
    //initialize variable to hold our keys
    const keys = [];
    // returns an array of a key value pair in our fields object
    for (const [key, value] of Object.entries(fields)) {
      // check if its nested and/or empty
      if (typeof value === 'object' && value !== null) {
        // recursively call our nested value with the current path:key
        if (Array.isArray(value) && value.length === 0) continue;
        if (Object.keys(value).length === 0) continue;
        keys.push(...traverseFields(value, `${path}:${key}`));
      } else {
        //if the value isn't null nor is it an object then we can push it into our keys array
        keys.push(`${path}:${key}`);
      }
    }
    return keys;
  };
  // invoke to begin the recursion
  return traverseFields(proto.fields, base);
};

// function to store keys
const storeCacheKeys = (results, keys) => {
  keys.forEach((key) => {
    const splitKey = key.split(':');
    const segmentedKey = splitKey.slice(1);
    let data = results.data;
    for (const eachElement of segmentedKey) {
      data = data[eachElement];
      if (!data) break;
    }
    this.set(key, data);
  });
};

export { generateCacheKeys, storeCacheKeys };
