/**
 * Finds any requested information in the cache and assembles it on the cacheResponse.
 * Uses the prototype as a template for cacheResponse and marks any data not found in the cache
 * on the prototype for future retrieval from database.
 * @param {Object} prototype - Unique id under which the cached data will be stored.
 * @param {Array} prototypeKeys - Keys in the prototype.
 * @param {Object} itemFromCache - Item to be cached.
 * @param {boolean} firstRun - Boolean indicated if this is the first run.
 * @param {boolean|string} subID - Used to pass id to recursive calls.
 * @returns {Object} cacheResponse, mutates prototype.
 */

async function buildFromCache(
  prototype,
  prototypeKeys,
  itemFromCache = {},
  firstRun = true,
  subID = false
) {
  for (const typeKey in prototype) {
    if (prototypeKeys.includes(typeKey)) {
      let cacheID;
      if (typeof subID === 'string') {
        cacheID = subID;
      } else {
        cacheID = generateCacheID(prototype[typeKey]);
      }

      let keyName;
      if (prototype[typeKey]?.__args === null) {
        keyName = undefined;
      } else {
        keyName = Object.values(prototype[typeKey]?.__args)[0];
      }

      if (idCache[keyName] && idCache[keyName][cacheID]) {
        cacheID = idCache[keyName][cacheID];
      }

      const capitalized = cacheID.charAt(0).toUpperCase() + cacheID.slice(1);
      if (idCache[keyName] && idCache[keyName][capitalized]) {
        cacheID = idCache[keyName][capitalized];
      }

      const cacheResponse = await getFromRedis(cacheID, redisCache);
      itemFromCache[typeKey] = cacheResponse ? JSON.parse(cacheResponse) : {};
    }

    if (Array.isArray(itemFromCache[typeKey])) {
      let redisRunQueue = redisCache.multi();
      const array = itemFromCache[typeKey];

      for (let i = 0; i < array.length; i++) {
        if (typeof itemFromCache[typeKey] === 'string') {
          const getCommandCallback = (cacheResponse) => {
            const tempObj = {};

            if (cacheResponse) {
              const interimCache = JSON.parse(cacheResponse);

              for (const property in prototype[typeKey]) {
                if (
                  Object.prototype.hasOwnProperty.call(
                    interimCache,
                    property
                  ) &&
                  !property.includes('__')
                ) {
                  tempObj[property] = interimCache[property];
                } else if (
                  !property.includes('__') &&
                  typeof prototype[typeKey][property] === 'object'
                ) {
                  buildFromCache(
                    prototype[typeKey][property],
                    prototypeKeys,
                    {},
                    false,
                    `${currTypeKey}--${property}`
                  ).then((tempData) => (tempObj[property] = tempData.data));
                } else if (
                  !property.includes('__') &&
                  typeof prototype[typeKey][property] !== 'object'
                ) {
                  prototype[typeKey][property] = false;
                }
              }
              itemFromCache[typeKey][i] = tempObj;
            } else {
              for (const property in prototype[typeKey]) {
                if (
                  !property.includes('__') &&
                  typeof prototype[typeKey][property] !== 'object'
                ) {
                  prototype[typeKey][property] = false;
                }
              }
            }
          };

          const currTypeKey = itemFromCache[typeKey][i];

          if (i !== 0 && i % redisReadBatchSize === 0) {
            try {
              const cacheResponseRaw = await redisRunQueue.exec();
              cacheResponseRaw.forEach((cacheResponse) =>
                getCommandCallback(JSON.stringify(cacheResponse))
              );
            } catch (error) {
              const err = {
                log: `Error inside 1st-catch block of buildFromCache, ${error}`,
                status: 400,
                message: {
                  err: 'Error in buildFromCache. Check server log for more details.',
                },
              };
              console.log(err);
            }
            redisRunQueue = redisCache.multi();
          }

          redisRunQueue.get(currTypeKey.toLowerCase());

          try {
            const cacheResponseRaw = await redisRunQueue.exec();
            cacheResponseRaw.forEach((cacheResponse) =>
              getCommandCallback(JSON.stringify(cacheResponse))
            );
          } catch (error) {
            const err = {
              log: `Error inside 2nd-catch block of buildFromCache, ${error}`,
              status: 400,
              message: {
                err: 'Error in buildFromCache. Check server log for more details.',
              },
            };
            console.log(err);
          }
        }
      }
    } else if (firstRun === false) {
      if (
        (itemFromCache === null ||
          !Object.prototype.hasOwnProperty.call(itemFromCache, typeKey)) &&
        typeof prototype[typeKey] !== 'object' &&
        !typeKey.includes('__') &&
        !itemFromCache[0]
      ) {
        prototype[typeKey] = false;
      }
      if (
        !(Object.keys(itemFromCache).length > 0) &&
        typeof itemFromCache === 'object' &&
        !typeKey.includes('__') &&
        typeof prototype[typeKey] === 'object'
      ) {
        const cacheID = await generateCacheID(prototype);
        const cacheResponse = await getFromRedis(cacheID, redisCache);
        if (cacheResponse) itemFromCache[typeKey] = JSON.parse(cacheResponse);
        await buildFromCache(
          prototype[typeKey],
          prototypeKeys,
          itemFromCache[typeKey],
          false
        );
      }
    } else {
      for (const field in prototype[typeKey]) {
        if (
          itemFromCache[typeKey] &&
          !Object.prototype.hasOwnProperty.call(
            itemFromCache[typeKey],
            field
          ) &&
          !field.includes('__') &&
          typeof prototype[typeKey][field] !== 'object'
        ) {
          prototype[typeKey][field] = false;
        }

        if (
          !field.includes('__') &&
          typeof prototype[typeKey][field] === 'object'
        ) {
          await buildFromCache(
            prototype[typeKey][field],
            prototypeKeys,
            itemFromCache[typeKey][field] || {},
            false
          );
        } else if (
          !itemFromCache[typeKey] &&
          !field.includes('__') &&
          typeof prototype[typeKey][field] !== 'object'
        ) {
          prototype[typeKey][field] = false;
        }
      }
    }
  }
  return { data: itemFromCache };
}

// async buildFromCache(
//   prototype: ProtoObjType,
//   prototypeKeys: string[],
//   itemFromCache: ItemFromCacheType = {},
//   firstRun = true,
//   subID: boolean | string = false
// ): Promise<{ data: ItemFromCacheType }> {
//   for (const typeKey in prototype) {
//     // If the current key is a root query, check cache and set any results to itemFromCache.
//     if (prototypeKeys.includes(typeKey)) {
//       // Create a variable cacheID, used to determine what ID should be used for the Redis lookup.
//       let cacheID: string;
//       if (typeof subID === "string") {
//         // Use the subID argument if it is a string (used for recursive calls within buildFromCache).
//         cacheID = subID;
//       } else {
//         cacheID = this.generateCacheID(prototype[typeKey] as ProtoObjType);
//       }

//       let keyName: string | undefined;
//       // Value won't always be at .name on the args object
//       if ((prototype[typeKey] as ProtoObjType)?.__args === null) {
//         keyName = undefined;
//       } else {
//         keyName = Object.values(
//           (prototype[typeKey] as ProtoObjType)?.__args as object
//         )[0];
//       }

//       if (idCache[keyName as string] && idCache[keyName as string][cacheID]) {
//         cacheID = idCache[keyName as string][cacheID] as string;
//       }

//       // Capitalize first letter of cache ID just in case
//       const capitalized: string =
//         (cacheID as string).charAt(0).toUpperCase() + cacheID.slice(1);
//       if (
//         idCache[keyName as string] &&
//         idCache[keyName as string][capitalized]
//       ) {
//         cacheID = idCache[keyName as string][capitalized] as string;
//       }

//       // const cacheResponse: string | null | void = await getFromRedis(
//       //   cacheID
//       // );

//       const cacheResponse: string | null | void = await getFromRedis(
//         cacheID,
//         this.redisCache
//       );
//       itemFromCache[typeKey] = cacheResponse ? JSON.parse(cacheResponse) : {};
//     }

//     // If itemFromCache at the current key is an array, iterate through and gather data.
//     if (Array.isArray(itemFromCache[typeKey])) {
//       // Create a new Redis run queue.
//       let redisRunQueue: ReturnType<typeof this.redisCache.multi> =
//         this.redisCache.multi();

//       const array = itemFromCache[typeKey] as string[];

//       for (let i = 0; i < array.length; i++) {
//         if (typeof itemFromCache[typeKey] === "string") {
//           /**
//            * Helper function that will be called for each response in the
//            * array of responses returned by Redis' exec() command within buildFromCache.
//            * @param {string} cacheResponse - Response from one of the get commands in the Redis queue.
//            */
//           const getCommandCallback = (cacheResponse: string): void => {
//             const tempObj: ItemFromCacheType = {};

//             if (cacheResponse) {
//               const interimCache: ItemFromCacheType =
//                 JSON.parse(cacheResponse);

//               for (const property in prototype[typeKey] as ProtoObjType) {
//                 // If property exists, set on tempObj
//                 if (
//                   Object.prototype.hasOwnProperty.call(
//                     interimCache,
//                     property
//                   ) &&
//                   !property.includes("__")
//                 ) {
//                   tempObj[property] = interimCache[property];
//                 }
//                 // If prototype is nested at this field, recurse
//                 else if (
//                   !property.includes("__") &&
//                   typeof (prototype[typeKey] as ProtoObjType)[property] ===
//                     "object"
//                 ) {
//                   this.buildFromCache(
//                     (prototype[typeKey] as ProtoObjType)[
//                       property
//                     ] as ProtoObjType,
//                     prototypeKeys,
//                     {},
//                     false,
//                     `${currTypeKey}--${property}`
//                   ).then((tempData) => (tempObj[property] = tempData.data));
//                 }
//                 // If cache does not have property, set to false on prototype so that it is sent to GraphQL
//                 else if (
//                   !property.includes("__") &&
//                   typeof (prototype[typeKey] as ProtoObjType)[property] !==
//                     "object"
//                 ) {
//                   (prototype[typeKey] as ProtoObjType)[property] = false;
//                 }
//               }
//               itemFromCache[typeKey][i] = tempObj;
//             }
//             // If there is nothing in the cache for this key, toggle all fields to false so they will be fetched later.
//             else {
//               for (const property in prototype[typeKey] as ProtoObjType) {
//                 if (
//                   !property.includes("__") &&
//                   typeof (prototype[typeKey] as ProtoObjType)[property] !==
//                     "object"
//                 ) {
//                   (prototype[typeKey] as ProtoObjType)[property] = false;
//                 }
//               }
//             }
//           };

//           const currTypeKey: string = itemFromCache[typeKey][i];

//           // If the size of the current batch equals the redisReadBatchSize in the constructor
//           // execute the current batch and reset the queue.
//           if (i !== 0 && i % this.redisReadBatchSize === 0) {
//             try {
//               const cacheResponseRaw = await redisRunQueue.exec();
//               cacheResponseRaw.forEach((cacheResponse) =>
//                 getCommandCallback(JSON.stringify(cacheResponse))
//               );
//             } catch (error: Error | unknown) {
//               const err: ServerErrorType = {
//                 log: `Error inside 1st-catch block of buildFromCache, ${error}`,
//                 status: 400,
//                 message: {
//                   err: "Error in buildFromCache. Check server log for more details.",
//                 },
//               };
//               console.log(err);
//             }
//             redisRunQueue = this.redisCache.multi();
//           }

//           // Add a get command for the current type key to the queue.
//           redisRunQueue.get(currTypeKey.toLowerCase());

//           // Execute any remnants in redis run queue.
//           try {
//             const cacheResponseRaw = await redisRunQueue.exec();
//             cacheResponseRaw.forEach((cacheResponse) =>
//               getCommandCallback(JSON.stringify(cacheResponse))
//             );
//           } catch (error: Error | unknown) {
//             const err: ServerErrorType = {
//               log: `Error inside 2nd-catch block of buildFromCache, ${error}`,
//               status: 400,
//               message: {
//                 err: "Error in buildFromCache. Check server log for more details.",
//               },
//             };
//             console.log(err);
//           }
//         }
//       }
//     }

//     // Recurse through buildFromCache using typeKey and prototype.
//     // If itemFromCache is empty, then check the cache for data; otherwise, persist itemFromCache
//     // if this iteration is a nested query (i.e. if typeKey is a field in the query)
//     else if (firstRun === false) {
//       // If this field is not in the cache, then set this field's value to false.
//       if (
//         (itemFromCache === null ||
//           !Object.prototype.hasOwnProperty.call(itemFromCache, typeKey)) &&
//         typeof prototype[typeKey] !== "object" &&
//         !typeKey.includes("__") &&
//         !itemFromCache[0]
//       ) {
//         prototype[typeKey] = false;
//       }
//       // If this field is a nested query, then recurse the buildFromCache function and iterate through the nested query.
//       if (
//         !(Object.keys(itemFromCache).length > 0) &&
//         typeof itemFromCache === "object" &&
//         !typeKey.includes("__") &&
//         typeof prototype[typeKey] === "object"
//       ) {
//         const cacheID: string = await this.generateCacheID(prototype);
//         const cacheResponse: string | null | void = await getFromRedis(
//           cacheID,
//           this.redisCache
//         );
//         if (cacheResponse) itemFromCache[typeKey] = JSON.parse(cacheResponse);
//         await this.buildFromCache(
//           prototype[typeKey] as ProtoObjType,
//           prototypeKeys,
//           itemFromCache[typeKey],
//           false
//         );
//       }
//     }
//     // If not an array and not a recursive call, handle normally
//     else {
//       for (const field in prototype[typeKey] as ProtoObjType) {
//         // If field is not found in cache then toggle to false
//         if (
//           itemFromCache[typeKey] &&
//           !Object.prototype.hasOwnProperty.call(
//             itemFromCache[typeKey],
//             field
//           ) &&
//           !field.includes("__") &&
//           typeof (prototype[typeKey] as ProtoObjType)[field] !== "object"
//         ) {
//           (prototype[typeKey] as ProtoObjType)[field] = false;
//         }

//         // If field contains a nested query, then recurse the function and iterate through the nested query
//         if (
//           !field.includes("__") &&
//           typeof (prototype[typeKey] as ProtoObjType)[field] === "object"
//         ) {
//           await this.buildFromCache(
//             (prototype[typeKey] as ProtoObjType)[field] as ProtoObjType,
//             prototypeKeys,
//             itemFromCache[typeKey][field] || {},
//             false
//           );
//         }
//         // If there are no data in itemFromCache, toggle to false
//         else if (
//           !itemFromCache[typeKey] &&
//           !field.includes("__") &&
//           typeof (prototype[typeKey] as ProtoObjType)[field] !== "object"
//         ) {
//           (prototype[typeKey] as ProtoObjType)[field] = false;
//         }
//       }
//     }
//   }
//   // Return itemFromCache on a data property to resemble GraphQL response format.
//   return { data: itemFromCache };
// }
