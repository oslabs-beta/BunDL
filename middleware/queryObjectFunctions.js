/**
 * Iterates through passed-in proto object, removing fields retrieved from the Redis cache.
 * The returned object is intended to be passed to `convertQueryObjToString` for further processing.
 * @param {Object} proto
 * @returns object
 */
const filterOutCachedResults = (proto) => {
  const dbQueryObj = {};
  for (const key in proto) {
    const reducedProto = this.extractFalseValueKeys(proto[key]);
    if (reducedProto.length > 0) dbQueryObj[key] = reducedProto;
  }
  return dbQueryObj;
};

/**
 *Recursively extracts keys with `false` values from an object, including nested objects.
 * For nested objects, the returned array will contain an object with the nested object's key as its property and its value as an array of keys with `false` values.
 * @param {Object} proto the object to extract keys from
 * @returns {Array} an array containing the keys with  'false' values and objects for nested content
 */
const extractFalseValueKeys = (proto) => {
  const fields = [];
  for (const key in proto) {
    if (proto[key] === false) fields.push(key);
    if (typeof proto[key] === 'object') {
      const nestedObj = {};
      const reducedProto = this.extractFalseValueKeys(proto[key]);
      if (reducedProto.length > 0) {
        nestedObj[key] = reducedProto;
        fields.push(nestedObj);
      }
    }
  }
  return fields;
};

const convertQueryObjectToString = (queryObject) => {
  const stringifyQuery = (item) => {
    if (typeof item === 'string') {
      return item;
    }
    if (Array.isArray(item)) {
      return item.map(stringifyQuery).join(' ');
    }
    return Object.entries(item)
      .map(([key, value]) => `${key} { ${this.stringifyQuery(value)} }`)
      .join(' ');
  };
  return `{ ${stringifyQuery(queryObject)} }`;
};

module.exports = {
  filterOutCachedResults,
  extractFalseValueKeys,
  convertQueryObjectToString,
  stringifyQuery,
};
