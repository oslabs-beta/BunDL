  /**
   * Updates the Redis cache when the operation is a mutation.
   * - For update and delete mutations, checks if the mutation query includes an id.
   * If so, it will update the cache at that id. If not, it will iterate through the cache
   * to find the appropriate fields to update/delete.
   * @param {Object} dbRespDataRaw - Raw response from the database returned following mutation.
   * @param {string} mutationName - Name of the mutation (e.g. addItem).
   * @param {string} mutationType - Type of mutation (add, update, delete).
   * @param {Object} mutationQueryObject - Arguments and values for the mutation.
   */
  async updateCacheByMutation(
    dbRespDataRaw: DatabaseResponseDataRaw | ExecutionResult,
    mutationName: string,
    mutationType: string,
    mutationQueryObject: QueryFields | ProtoObjType
  ) {
    let fieldsListKey: string;
    let dbRespId = "";
    let dbRespData: Type = {};
    if (dbRespDataRaw.data) {
      // TODO: Need to modify this logic if ID is not being requested back during
      // mutation query.
      // dbRespDataRaw.data[mutationName] will always return the value at the mutationName
      // in the form of an object.
      dbRespId = (dbRespDataRaw.data[mutationName] as TypeData)?.id as string;
      dbRespData = await JSON.parse(
        JSON.stringify(dbRespDataRaw.data[mutationName])
      );
    }

    for (const queryKey in this.queryMap) {
      const queryKeyType: string | string[] = this.queryMap[queryKey] as
        | string
        | string[];

      if (JSON.stringify(queryKeyType) === JSON.stringify([mutationType])) {
        fieldsListKey = queryKey;
        break;
      }
    }

    /**
     * Helper function to delete field keys from cached field list.
     * @param {Set<string> | Array<string>} fieldKeysToRemove - Field keys to be removed from the cached field list.
     */
    const removeFromFieldKeysList = async (
      fieldKeysToRemove: Set<string> | Array<string>
    ) => {
      if (fieldsListKey) {
        const cachedFieldKeysListRaw = await getFromRedis(
          fieldsListKey,
          this.redisCache
        );
        if (
          cachedFieldKeysListRaw !== null &&
          cachedFieldKeysListRaw !== undefined
        ) {
          const cachedFieldKeysList: string[] = JSON.parse(
            cachedFieldKeysListRaw
          );

          fieldKeysToRemove.forEach((fieldKey: string) => {
            // Index position of field key to remove from list of field keys
            const removalFieldKeyIdx: number =
              cachedFieldKeysList.indexOf(fieldKey);
            if (removalFieldKeyIdx !== -1) {
              cachedFieldKeysList.splice(removalFieldKeyIdx, 1);
            }
          });
          this.writeToCache(fieldsListKey, cachedFieldKeysList);
        }
      }
    };

    /**
     * Helper function that loops through the cachedFieldKeysList and helps determine which
     * fieldKeys should be deleted and passes those fields to removeFromFieldKeysList for removal.
     */
    const deleteApprFieldKeys = async () => {
      if (fieldsListKey) {
        const cachedFieldKeysListRaw = await getFromRedis(
          fieldsListKey,
          this.redisCache
        );
        if (
          cachedFieldKeysListRaw !== null &&
          cachedFieldKeysListRaw !== undefined
        ) {
          const cachedFieldKeysList: string[] = JSON.parse(
            cachedFieldKeysListRaw
          );

          const fieldKeysToRemove: Set<string> = new Set();
          for (let i = 0; i < cachedFieldKeysList.length; i++) {
            const fieldKey: string = cachedFieldKeysList[i];

            const fieldKeyValueRaw = await getFromRedis(
              fieldKey.toLowerCase(),
              this.redisCache
            );
            if (fieldKeyValueRaw !== null && fieldKeyValueRaw !== undefined) {
              const fieldKeyValue: FieldKeyValue = JSON.parse(fieldKeyValueRaw);

              let remove = true;
              for (const arg in mutationQueryObject.__args as ProtoObjType) {
                if (Object.prototype.hasOwnProperty.call(fieldKeyValue, arg)) {
                  const argValue: string = (
                    mutationQueryObject.__args as ProtoObjType
                  )[arg] as string;
                  if (fieldKeyValue[arg] !== argValue) {
                    remove = false;
                    break;
                  }
                } else {
                  remove = false;
                  break;
                }
              }

              if (remove === true) {
                fieldKeysToRemove.add(fieldKey);
                this.deleteCacheById(fieldKey.toLowerCase());
              }
            }
          }
          removeFromFieldKeysList(fieldKeysToRemove);
        }
      }
    };

    /**
     * Helper function that loops through the cachedFieldKeysList and updates the appropriate
     * field key values and writes the updated values to the redis cache
     */
    const updateApprFieldKeys = async () => {
      const cachedFieldKeysListRaw = await getFromRedis(
        fieldsListKey,
        this.redisCache
      );
      // conditional just in case the resolver wants to throw an error. instead of making quellCache invoke it's caching functions, we break here.
      if (cachedFieldKeysListRaw === undefined) return;
      // list of field keys stored on redis
      if (cachedFieldKeysListRaw !== null) {
        const cachedFieldKeysList: string[] = JSON.parse(
          cachedFieldKeysListRaw
        );

        // Iterate through field key field key values in Redis, and compare to user
        // specified mutation args to determine which fields are used to update by
        // and which fields need to be updated.

        cachedFieldKeysList.forEach(async (fieldKey) => {
          const fieldKeyValueRaw = await getFromRedis(
            fieldKey.toLowerCase(),
            this.redisCache
          );
          if (fieldKeyValueRaw !== null && fieldKeyValueRaw !== undefined) {
            const fieldKeyValue: ResponseDataType =
              JSON.parse(fieldKeyValueRaw);

            const fieldsToUpdateBy: string[] = [];
            const updatedFieldKeyValue: ResponseDataType = fieldKeyValue;

            Object.entries(mutationQueryObject.__args as ProtoObjType).forEach(
              ([arg, argVal]) => {
                if (arg in fieldKeyValue && fieldKeyValue[arg] === argVal) {
                  // Foreign keys are not fields to update by
                  if (arg.toLowerCase().includes("id") === false) {
                    fieldsToUpdateBy.push(arg);
                  }
                } else {
                  if (typeof argVal === "string")
                    updatedFieldKeyValue[arg] = argVal;
                }
              }
            );

            if (fieldsToUpdateBy.length > 0) {
              this.writeToCache(fieldKey, updatedFieldKeyValue);
            }
          }
        });
      }
    };
    // If there is no id property on dbRespDataRaw.data[mutationName]
    // dbRespId defaults to an empty string and no redisKey will be found.
    const hypotheticalRedisKey = `${mutationType.toLowerCase()}--${dbRespId}`;
    const redisKey: string | void | null = await getFromRedis(
      hypotheticalRedisKey,
      this.redisCache
    );

    if (redisKey) {
      // If the key was found in the Redis server cache, the mutation is either update or delete mutation.
      if (mutationQueryObject.__id) {
        // If the user specifies dbRespId as an argument in the mutation, then we only need to
        // update/delete a single cache entry by dbRespId.
        if (mutationName.substring(0, 3) === "del") {
          // If the first 3 letters of the mutationName are 'del' then the mutation is a delete mutation.
          // Users have to prefix their delete mutations with 'del' so that quell can distinguish between delete/update mutations.
          this.deleteCacheById(
            `${mutationType.toLowerCase()}--${mutationQueryObject.__id}`
          );
          removeFromFieldKeysList([`${mutationType}--${dbRespId}`]);
        } else {
          // Update mutation for single dbRespId
          this.writeToCache(
            `${mutationType.toLowerCase()}--${mutationQueryObject.__id}`,
            dbRespData
          );
        }
      } else {
        // If the user didn't specify dbRespId, we need to iterate through all key value pairs and determine which key values match dbRespData.
        // Note that there is a potential edge case here if there are no queries that have type GraphQLList.
        // if (!fieldsListKey) throw 'error: schema must have a GraphQLList';

        // Unused variable
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const removalFieldKeysList = [];

        if (mutationName.substring(0, 3) === "del") {
          // Mutation is delete mutation
          deleteApprFieldKeys();
        } else {
          updateApprFieldKeys();
        }
      }
    } else {
      // If the key was not found in the Redis server cache, the mutation is an add mutation.
      this.writeToCache(hypotheticalRedisKey, dbRespData);
    }
  }