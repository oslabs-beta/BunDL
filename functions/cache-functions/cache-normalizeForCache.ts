  /**
   * Traverses over response data and formats it appropriately so that it can be stored in the cache.
   * @param {Object} responseData - Data we received from an external source of data such as a database or API.
   * @param {Object} map - Map of queries to their desired data types, used to ensure accurate and consistent caching.
   * @param {Object} protoField - Slice of the prototype currently being used as a template and reference for the responseData to send information to the cache.
   * @param {string} currName - Parent object name, used to pass into updateIDCache.
   */
  async normalizeForCache(
    responseData: ResponseDataType,
    map: QueryMapType = {},
    protoField: ProtoObjType,
    currName: string
  ) {
    

    for (const resultName in responseData) {
      const currField = responseData[resultName];
      const currProto: ProtoObjType = protoField[resultName] as ProtoObjType;
      if (Array.isArray(currField)) {
       

        
        for (let i = 0; i < currField.length; i++) {
          const el: ResponseDataType = currField[i];

          const dataType: string | undefined | string[] = map[resultName];

          if (typeof el === "object" && typeof dataType === "string") {
            await this.normalizeForCache(
              { [dataType]: el },
              map,
              {
                [dataType]: currProto,
              },
              currName
            );
          }
        }
      } else if (typeof currField === "object") {
        // Need to get non-Alias ID for cache

        // Temporary store for field properties
        const fieldStore: ResponseDataType = {};


        // Create a cacheID based on __type and __id from the prototype.
        let cacheID: string = Object.prototype.hasOwnProperty.call(map, currProto.__type as string)
          ? (map[currProto.__type as string] as string)
          : (currProto.__type as string);

        cacheID += currProto.__id ? `--${currProto.__id}` : "";
        
        // Iterate over keys in nested object
        for (const key in currField) {
          // If prototype has no ID, check field keys for ID (mostly for arrays)
          if (
            !currProto.__id &&
            (key === "id" || key === "_id" || key === "ID" || key === "Id")
          ) {
            // If currname is undefined, assign to responseData at cacheid to lower case at name
            if (responseData[cacheID.toLowerCase()]) {
              const responseDataAtCacheID = responseData[cacheID.toLowerCase()];
              if (
                typeof responseDataAtCacheID !== "string" &&
                !Array.isArray(responseDataAtCacheID)
              ) {
                if (typeof responseDataAtCacheID.name === "string") {
                  currName = responseDataAtCacheID.name;
                }
              }
            }
            // If the responseData at lower-cased cacheID at name is not undefined, store under name variable
            // and copy the logic of writing to cache to update the cache with same things, all stored under name.
            // Store objKey as cacheID without ID added
            const cacheIDForIDCache: string = cacheID;
           

            

            cacheID += `--${currField[key]}`;
            // call IdCache here idCache(cacheIDForIDCache, cacheID)
           

            this.updateIdCache(cacheIDForIDCache, cacheID, currName);

          }

          fieldStore[key] = currField[key];


          // If object, recurse normalizeForCache assign in that object
          if (typeof currField[key] === "object") {
        

            if (protoField[resultName] !== null) {
            

              const test = await this.normalizeForCache(
                { [key]: currField[key] },
                map,
                {
                  [key]: (protoField[resultName] as ProtoObjType)[key],
                },
                currName
              );
            }
          }
        }
        // Store "current object" on cache in JSON format
        this.writeToCache(cacheID, fieldStore);
      }
    }
  }