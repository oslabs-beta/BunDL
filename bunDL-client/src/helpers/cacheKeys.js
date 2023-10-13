// this function is designed to segment a single proto into multiple keys
const generateCacheKeys = (proto, variableValues = {}) => {
  // this serves as the base for all the keys
  const base = `${proto.operation}:${proto.primaryQueryType}`;

  const traverseFields = (fields, path) => {
    //initialize variable to hold our keys
    const keys = [];
    // returns an array of a key value pair in our fields object
    for (const [key, value] of Object.entries(fields)) {
      // check if its nested and/or empty
      if (typeof value === 'object' && value !== 'null') {
        // recursively call our nested value with the current path:key
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

//example below

const proto = {
  operation: 'query',
  primaryQueryType: 'Book',
  fields: {
    title: true,
    author: {
      name: true,
      age: true,
    },
  },
};

['query:Book:title', 'query:Book:author:name', 'query:Book:author:age'];

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
    BunCache.set(key, data);
  });
};

export { generateCacheKeys, storeCacheKeys };
