// // this function is designed to segment a single proto into multiple keys
// const generateCacheKeys = (proto) => {
//   // this serves as the base for all the keys
//   const base = `${proto.operation}:`;

//   const traverseFields = (fields, path) => {
//     //initialize variable to hold our keys
//     const keys = [];
//     // returns an array of a key value pair in our fields object
//     for (const [key, value] of Object.entries(fields)) {
//       // check if its nested and/or empty
//       if (
//         typeof value === 'object' &&
//         value !== null &&
//         value.hasOwnProperty('$id')
//       ) {
//         // recursively call our nested value with the current path:key
//         if (Array.isArray(value) && value.length === 0) continue;
//         if (Object.keys(value).length === 0) continue;
//         const newPath = `${path}:${key}:${value.$id}`;
//         keys.push(...traverseFields(value, newPath));
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

// const generateCacheKeys = (proto) => {
//   let resultKeys = [];

//   const { fields, operation, variableValues } = proto;

//   // Helper function to traverse nested fields
//   const traverseFields = (fieldDef, primaryType) => {
//     for (const [field, value] of Object.entries(fieldDef)) {
//       // Check if it's a nested field by checking if the field starts with a $
//       if (typeof value === 'object' && value.$id && value.$id.startsWith('$')) {
//         // Recursively handle nested fields
//         traverseFields(value, field);
//       } else if (value === true) {
//         const idValue = variableValues[primaryType].id;
//         resultKeys.push(`${operation}:${primaryType}:$${idValue}:${field}`);
//       }
//     }
//   };

//   traverseFields(fields[proto.primaryQueryType], proto.primaryQueryType);

//   return resultKeys;
// };

// cacheKey.test.js:
// [ "query:user:$id", "query:user:id", "query:user:firstName", "query:user:lastName", "query:user:email",
//   "query:user:phoneNumber", "query:user:address:$id", "query:user:address:street", "query:user:address:city",
//   "query:user:address:state", "query:user:address:zip", "query:user:address:country" ]

// cacheKey.test.js:
// [ "query:user:$id", "query:user:id", "query:user:firstName", "query:user:lastName", "query:user:email",
//   "query:user:phoneNumber", "query:user:address:$id", "query:user:address:street", "query:user:address:city",
//   "query:user:address:state", "query:user:address:zip", "query:user:address:country" ]
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
