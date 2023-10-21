import BunCache from './bunDL-client/src/bunCache.js';

// BUILT FOR CLIENT

// this function is designed to segment a single proto into multiple keys
// export const generateCacheKeys = (proto, variableValues = {}) => {
//   // this serves as the base for all the keys
//   const base = `${proto.operation}:${proto.primaryQueryType}`;

//   const traverseFields = (fields, path) => {
//     //initialize variable to hold our keys
//     const keys = [];
//     // returns an array of a key value pair in our fields object
//     for (const [key, value] of Object.entries(fields)) {
//       // check if its nested and/or empty
//       if (typeof value === 'object' && value !== 'null') {
//         // recursively call our nested value with the current path:key
//         keys.push(...traverseFields(value, `${path}:${key}`));
//       } else {
//         //if the value isn't null nor is it an object then we can push it into our keys array
//         keys.push(`${path}:${key}`);
//       }
//     }
//     return keys;
//   };
//   // invoke to begin the recursion
//   return traverseFields(proto.fields, base);
// };

//example below

// const proto = {
//   operation: 'query',
//   primaryQueryType: 'Book',
//   id: '123',
//   fields: {
//     title: true,
//     extras: {
//       author: true,
//       age: true,
//     },
//     year: true,
//     author: [
//       {
//         name: true,
//         age: true,
//       },
//       {
//         name: true,
//         age: true,
//       },
//     ],
//   },
// };

// const queryResults = {
//   data: {
//     Book: {
//       id: 1,
//       title: 'The Great Gatsby',
//       extras: {
//         author: 'ken',
//         age: 50,
//       },
//       year: 1900,
//       author: [
//         {
//           name: 'F. Scott Fitzgerald',
//           age: 44,
//         },
//         {
//           name: 'Shi Kuang',
//           age: 60,
//         },
//       ],
//     },
//   },
// };

// const keys = generateCacheKeys(proto);
// console.log(keys);

// const missingCacheKeys = ['query:Book:title', 'query:Book:author', 'query:Book:extras'];

// function normalizeResults(queryResults, missingCacheKeys) {
//   const normalizedResults = {};

//   function normalizeData(queryResults, key) {
//     let copy = queryResults.data;
//     console.log(copy)
//     console.log(key)
//     key.forEach((eachKey) => {
//       if (typeof copy === 'object') {
//         if (Array.isArray(copy)) {
//           copy = copy.map((item)=>normalizeData(item, key))
//         }
//         else {
//           copy = copy[eachKey]
//         }
//       }
//       console.log(eachKey)
//       copy = copy[eachKey]
//       console.log(copy)
//   })
//   console.log(copy)
//   return copy

//   }

// { 'query:Book:title': 'The Great Gatsby',
//   'query:Book:author':
//     { name: 'F. Scott Fitzgerald', age: 44 }
// { 'query:Book:title': 'The Great Gatsby 2’,
//   'query:Book:author':
//     { name: 'F. Scott Fitzgerald', age: 44 }
// { 'query:Book:author: Fitzgerald
//   'query:Book:title:
//     { name: gatbsy}
//     { name: gatbsy2}

//   missingCacheKeys.forEach((cacheKey) => {
//     const key = cacheKey.split(':').slice(1);
//     console.log(key);
//     const value = normalizeData(queryResults, key);
//     console.log(value);
//     console.log(cacheKey)
//     normalizedResults[cacheKey] = value;
//   });

//   return normalizedResults;
// }

// function normalizeResults(queryResults, missingCacheKeys) {
//   const normalizedResults = {};

//   function normalizeData(data, key) {
//     //create copy of data
//     let copy = data;
//     //loop through items in key
//     for (const segment of key) {
//       //if copy is an object
//       if (copy && typeof copy === 'object') {
//         // if copy is an array
//         if (Array.isArray(copy)) {
//           console.log(copy);
//           console.log(segment);
//           //reassign copy to an array of items that are normalized // invokes normalizedData passing in item which goes through the loop to check if it's an object, if not it will return the item
//           copy = copy.map((item) => normalizeData(item, [segment]));
//           console.log(copy)
//         } else {
//           // if copy is an object, then reassign copy to the value of copy[segment]
//           copy = copy[segment];
//         }
//       } else {
//         return copy;
//       }
//     }
//     return copy;
//   }

//   missingCacheKeys.forEach((cacheKey) => {
//     const key = cacheKey.split(':').slice(1);
//     console.log(key)
//     const value = normalizeData(queryResults.data, key);
//     normalizedResults[cacheKey] = value;
//   });

//   return normalizedResults;
// }

// const sample = normalizeResults(queryResults, missingCacheKeys);
// console.log(sample);

// function to store keys
// const storeCacheKeys = (results, keys) => {
//   console.log(results)
//   console.log(keys)
//   keys.forEach((key) => {
//     const splitKey = key.split(':');
//     const segmentedKey = splitKey.slice(1);
//     console.log(segmentedKey)
//     let data = results.data;
//     console.log(data)
//     console.log(segmentedKey)
//     for (const eachElement of segmentedKey) {
//       console.log(eachElement)
//       data = data[eachElement];
//       console.log(data)
//       if (!data) break;
//     }
//     console.log(data);
//     // BunCache.set(segmentedKey, data)
//   });
// };

// const data = storeCacheKeys(results, keys);
// console.log(data);

const query = `{
        Book (id: "6521aebe1882b34d9bc89017"){
          id
          firstName: name
          address {
            id
            street
            city
          }
        }
      }`;

console.log('hello.....');

// console.log(BunCache.clientQuery(query));
