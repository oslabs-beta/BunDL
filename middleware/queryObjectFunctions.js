/**
 * Iterates through passed-in proto object, removing fields retrieved from the Redis cache.
 * The returned object is intended to be passed to `convertQueryObjToString` for further processing.
 * @param {Object} proto
 * @returns object
 */
const filterOutCachedResults = (proto) => {
  const dbQueryObj = {};
  for (const key in proto) {
    const reducedProto = this.toggleProtoFieldsToFalse(proto[key]);
    if (reducedProto.length > 0) dbQueryObj[key] = reducedProto;
  }
  return dbQueryObj;
};

const toggleProtoFieldsToFalse = (proto) => {
  const fields = [];
  for (const key in proto) {
    if (proto[key] === false) fields.push(key);
    if (typeof proto[key] === 'object') {
      const nestedObj = {};
      const reducedProto = this.toggleProtoFieldsToFalse(proto[key]);
      if (reducedProto.length > 0) {
        nestedObj[key] = reducedProto;
        fields.push(nestedObj);
      }
    }
  }
  return fields;
};

const convertQueryObjectToString = (queryObject) => {};

const stringifyQuery = (fieldsArray) => {};

module.exports = {
  filterOutCachedResults,
  toggleProtoFieldsToFalse,
  convertQueryObjectToString,
  stringifyQuery,
};

const person = {
  firstName: 'Garth',
  lastName: 'Emard',
  email: 'Sadie.Roob40@yahoo.com',
  address: {
    street: '7036 Ida Stream',
    city: 'East Orange',
    state: 'North Carolina',
    zip: '81725-4936',
    country: 'Georgia',
  },
};

console.log(filterOutCachedResults(person));
