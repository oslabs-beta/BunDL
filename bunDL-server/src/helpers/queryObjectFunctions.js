/** refactored from quell - ALL UNUSED right now
 * Iterates through passed-in proto object, removing fields retrieved from the Redis cache.
 * The returned object is intended to be passed to `convertQueryObjToString` for further processing.
 * @param {Object} proto
 * @returns object
 */

//======== proto reducer ============
const filterOutCachedResults = function (proto) {
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

//============= build Item =================
const extractFalseValueKeys = function (proto) {
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

//==============create query string===================
const convertQueryObjectToString = function (queryObject) {
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

// !==============convert queryStringToObject==================//
const convertGraphQLQueryToObject = function (queryArray, redisKey) {
  // Initialize an empty stack to manage nesting
  const stack = [];
  // Initialize an empty object to represent the query
  let queryObject = {};

  // Push the root object onto the stack
  stack.push({ obj: queryObject, key: null });

  // Iterate over the cleaned query array
  for (const token of queryArray) {
    // Ignore parentheses and commas
    if (token === '{' || token === '}' || token === '(' || token === ')')
      continue;

    // Get the current working object from the top of the stack
    const current = stack[stack.length - 1].obj;

    // Detect if token is an id field
    const idMatch = token.match(/user\(id:\s*"([^"]+)"\)/);

    if (idMatch) {
      current['id'] = null; // Or set to the ID matched, depending on your needs
      continue;
    }

    // If we encounter an opening bracket, that means a nested object is starting
    if (token === '{') {
      const newKey = stack[stack.length - 1].key;
      current[newKey] = {};
      stack.push({ obj: current[newKey], key: null });
    }
    // If we encounter a closing bracket, pop from the stack
    else if (token === '}') {
      stack.pop();
    }
    // Otherwise, add the field to the current working object and set as null
    else {
      current[token] = null;
      stack[stack.length - 1].key = token;
    }
  }

  return queryObject;
};

// !==========================================================//
//============ join responses ==============//
const joinResponses = async function (cachedArray, uncachedArray) {
  const joinedArray = [];
  for (let i = 0; i < uncachedArray.lengt; i++) {
    const joinedItem = await this.recursiveJoin(
      cachedArray[i],
      uncachedArray[i]
    );
    joinedArray.push(joinedItem);
  }
  return joinedArray;
};

const recursiveJoin = async function (cachedItem, uncachedItem) {
  const joinedObject = { ...cachedItem };
  for (const field in uncachedItem) {
    if (Array.isArray(uncachedItem[field])) {
      if (typeof uncachedItem[field][0] === 'string') {
        const temp = await Promise.all(
          uncachedItem[field].map((refernce) =>
            this.fetchItemFromCache(reference)
          )
        );
        uncachedItem[field] = temp;
      }
      joinedObject[field] = cachedItem[field]
        ? await this.joinResponses(cachedItem[field], uncachedItem[field])
        : uncachedItem[field];
    } else {
      joinedObject[field] = uncachedItem[field];
    }
  }
  return joinedObject;
};

const extractIdFromQuery = (queryString) => {
  const regex = /id:\s*"([^"]+)"/;
  const match = queryString.match(regex);
  return match ? match[1] : null;
};

module.exports = {
  filterOutCachedResults,
  extractFalseValueKeys,
  convertQueryObjectToString,
  extractIdFromQuery,
  convertGraphQLQueryToObject,
};
