// // this function is designed to segment a single proto into multiple keys
export const generateCacheKeys = (proto, variableValues = {}) => {
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
    // console.log(keys);
    return keys;
  };
  // invoke to begin the recursion
  return traverseFields(proto.fields, base);
};

// // //example below

// // const proto = {
// //   operation: 'query',
// //   primaryQueryType: 'Book',
// //   id: 123,
// //   fields: {
// //     title: true,
// //     author: {
// //       name: true,
// //       age: true,
// //     },
// //   },
// // };

// // //results = ['query:Book:title', 'query:Book:author:name', 'query:Book:author:age'];
// // //query {
// // //   users {
// // //     name,
// // //     age,
// // //   }
// // // }

// // // function to store keys
// // export const storeCacheKeys = (results, keys) => {
// //   keys.forEach((key) => {
// //     const splitKey = key.split(':');
// //     const segmentedKey = splitKey.slice(1);
// //     let data = results.data;
// //     for (const eachElement of segmentedKey) {
// //       data = data[eachElement];
// //       console.log(data);
// //       if (!data) break;
// //     }

// //     // console.log(key);
// //     // console.log(data);

// //     BunCache.set(key, data);

// //   });
// // };

// // //getCacheKeys for PouchDB
// // const CacheKeys = (results, keys) => {
// //   keys.forEach((key) => {
// //     const splitKey = key.split(':');
// //     const segmentedKey = splitKey.slice(1);
// //     let data = results.data;
// //     for (const eachElement of segmentedKey) {
// //       data = data[eachElement];
// //       console.log(data);
// //       if (!data) break;
// //     }

// //     // console.log(key);
// //     // console.log(data);

// //     BunCache.set(key, data);

// //   });
// // };

// // const results1 = generateCacheKeys(proto);
// // //console.log(results1);

// // //module.exports = { generateCacheKeys, storeCacheKeys };
// // //

// // function normalizeResults(data) {
// //   const normalizedData = {};

// //   function processEntity(entity, entityType) {
// //     if (!normalizedData[entityType]) {
// //       normalizedData[entityType] = {};
// //     }

// //     if (entity.id) {
// //       const entityId = entity.id;
// //       normalizedData[entityType][entityId] = { id: entityId, ...entity };
// //     }

// //     for (const key in entity) {
// //       if (Array.isArray(entity[key])) {
// //         entity[key] = entity[key].map((item) => {
// //           if (item.id) {
// //             return item.id;
// //           }
// //           return item;
// //         });
// //       } else if (typeof entity[key] === 'object') {
// //         processEntity(entity[key], key);
// //       }
// //     }
// //   }

// //   for (const entityName in data) {
// //     processEntity(data[entityName], entityName);
// //   }

// //   return normalizedData;
// // }

// // const input = {
// //   country: {
// //     id: '636afe1b8c11797007e7e49a',
// //     name: 'United States',
// //     cities: [
// //       {
// //         id: '646bfefb636b411332f7a09e',
// //         name: 'Los Angeles',
// //         attractions: [
// //           {
// //             id: '636b02738c11797007e7e4b2',
// //             name: 'Santa Monica Pier',
// //           },
// //           {
// //             id: '636b02408c11797007e7e4af',
// //             name: 'Hollywood Sign',
// //           },
// //         ],
// //       },
// //       {
// //         id: '646bf122112efb636fgdfgdf',
// //         name: 'SF',
// //         attractions: [
// //           {
// //             id: '354354545e4b2',
// //             name: 'SF BRIDGE',
// //           },
// //           {
// //             id: 'ASDFASDF',
// //             name: 'SAN MATEO BRIDGE',
// //           },
// //         ],
// //       },
// //       // ... (other cities)
// //     ],
// //   },
// // };

// /**
//  * Normalize a JSON array by recursively normalizing each element.
//  * @param arr - the JSON array to be normalized.
//  * @returns - the normalized JSON array.
//  */
// // const normalizeArray = (arr: JSONValue[]): JSONValue[] => {
// //   return arr.map((value) => {
// //     // Normalize each element in the array
// //     return normalizeValue(value);
// //   });
// // };

// // const input2 = {
// //   data: null,
// //   errors: [
// //     {
// //       message: 'User not found',
// //       locations: [{ line: 2, column: 3 }],
// //       path: ['user'],
// //     },
// //   ],
// // };

// const graphqlResponse = {
//   user: {
//     id: '1',
//     name: 'John Doe',
//     posts: [
//       { id: '1', title: 'Post 1' },
//       { id: '2', title: 'Post 2' },
//     ],
//   },
// };

// // console.log(normalizeResults(input));
// // console.log(normalizeResult(input));


// const normalizeResults = (results: JSONObject): JSONObject => {
//   const normalizedResults: JSONObject = {};
//   // Iterate over the entries of the results object
//   const entries = Object.entries(results);
//   for (const [key, value] of entries) {
//     // Normalize the value
//     const normalizedValue = normalizeValue(value);
//     // Assign the normalized value to the corresponding key in the normalized results object
//     normalizedResults[key] = normalizedValue;
//   }
//   return normalizedResults;
// };

// /**
//  * Normalize a JSON value by checking its type and applying the corresponding normalization logic.
//  * @param value - the JSON value to be normalized.
//  * @returns - the normalized JSON value.
//  */
// const normalizeValue = (value: JSONValue): JSONValue => {
//   // If the value is null, return null
//   if (value === null) return null;
//   // If the value is an array, recursively normalize each element
//   else if (Array.isArray(value)) return normalizeArray(value);
//   // If the value is an object, recursively normalize each property
//   else if (typeof value === 'object' && value !== null) return normalizeObject(value);
//   // If the value is neither an array nor an object, return the value as is
//   else return value;
// };

// /**
//  * Normalize a JSON object by recursively normalizing each value.
//  * @param obj - the JSON object to be normalized.
//  * @returns - the normalized JSON object.
//  */
// const normalizeObject = (obj: JSONObject): JSONObject => {
//   const normalizedObj: JSONObject = {};
//   // Iterate over the entries of the object
//   const entries = Object.entries(obj);
//   // Normalize the value
//   for (const [key, value] of entries) {
//     const normalizedValue = normalizeValue(value);
//     // Assign the normalized value to the corresponding key in the normalized object
//     normalizedObj[key] = normalizedValue;
//   }
//   return normalizedObj;
// };

// /**
//  * Normalize a JSON array by recursively normalizing each element.
//  * @param arr - the JSON array to be normalized.
//  * @returns - the normalized JSON array.
//  */
// const normalizeArray = (arr: JSONValue[]): JSONValue[] => {
//   return arr.map((value) => {
//     // Normalize each element in the array
//     return normalizeValue(value);
//   });
// };

// // console.log(mergeGraphQLresponses(response, result));
// console.log(normalizeResults(graphqlResponse));




const proto1nest = {
  fields: {
    user: {
      $id: '123',
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    },
  },
  fragsDefinitions: {},
  primaryQueryType: 'user',
  fragmentType: '',
  variableValues: {
    user: {
      userId: '123',
    },
    address: {
      id: '456',
    },
  },
  operation: 'query',
};

const extractedIds = {};
const variableValues = proto1nest.variableValues;

for (const key in variableValues) {
  if (variableValues[key] === 'id') {
    extractedIds[`${key}Id`] = variableValues[key].id;
  }
}

console.log(extractedIds)