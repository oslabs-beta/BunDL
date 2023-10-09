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
 * Iteratively and recursively extracts keys with `false` values from an object, including those within nested objects. Returns an array containing keys associated with `false` values and objects for nested content.
 *
 * @param {Object} proto - The object from which to extract keys.
 * @returns {Array} An array of extracted keys and nested objects.
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

/**
 * Converts a given query object into a properly formatted GraphQL query string.
 * If the query object contains strings, they are added directly. If it contains arrays or nested objects, the function processes them recursively to build the query string.
 * @param {Object} queryObject - The object to be converted into a GraphQL query string.
 * @returns {string} A GraphQL formatted query string.
 */
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
};
