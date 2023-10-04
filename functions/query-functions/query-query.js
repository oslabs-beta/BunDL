/**
   * The class's controller method. It:
   *    - reads the query string from the request object,
   *    - tries to construct a response from cache,
   *    - reformulates a query for any data not in cache,
   *    - passes the reformulated query to the graphql library to resolve,
   *    - joins the cached and uncached responses,
   *    - decomposes and caches the joined query, and
   *    - attaches the joined response to the response object before passing control to the next middleware.
   *  @param {Request} req - Express request object, including request body with GraphQL query string.
   *  @param {Response} res - Express response object, will carry query response to next middleware.
   *  @param {NextFunction} next - Express next middleware function, invoked when QuellCache completes its work.
   */

   export class QuellCache {
    idCache: IdCacheType;
    schema: GraphQLSchema;
    costParameters: CostParamsType;
    queryMap: QueryMapType;
    mutationMap: MutationMapType;
    fieldsMap: FieldsMapType;
    cacheExpiration: number;
    redisReadBatchSize: number;
    redisCache: RedisClientType;
    constructor({
      schema,
      cacheExpiration = 1209600, // Default expiry time is 14 days in seconds
      costParameters = defaultCostParams,
      redisPort,
      redisHost,
      redisPassword,
    }: ConstructorOptions) {
      this.idCache = idCache;
      this.schema = schema;
      this.costParameters = Object.assign(defaultCostParams, costParameters);
      this.depthLimit = this.depthLimit.bind(this);
      this.costLimit = this.costLimit.bind(this);
      this.rateLimiter = this.rateLimiter.bind(this);
      this.queryMap = getQueryMap(schema);
      this.mutationMap = getMutationMap(schema);
      this.fieldsMap = getFieldsMap(schema);
      this.cacheExpiration = cacheExpiration;
      this.redisReadBatchSize = 10;
      this.redisCache = redisCacheMain;
      this.query = this.query.bind(this);
      this.clearCache = this.clearCache.bind(this);
      this.buildFromCache = this.buildFromCache.bind(this);
      this.generateCacheID = this.generateCacheID.bind(this);
      this.updateCacheByMutation = this.updateCacheByMutation.bind(this);
      this.deleteCacheById = this.deleteCacheById.bind(this);
    }



  async query(
    req
    res
    next
  ): Promise<void> {
    // Return an error if no query is found on the request.
    if (!req.body.query) {
      const err = {
        log: "Error: no GraphQL query found on request body",
        status: 400,
        message: {
          err: "Error in quellCache.query: Check server log for more details.",
        },
      };
      return next(err);
    }

    // Retrieve GraphQL query string from request body.
    const queryString: string = req.body.query;

    // Create the abstract syntax tree with graphql-js parser.
    // If depth limit or cost limit were implemented, then we can get the AST and parsed AST from res.locals.

    const AST = res.locals.AST ? res.locals.AST : parse(queryString);

    // Create response prototype, operation type, and fragments object.
    // The response prototype is used as a template for most operations in Quell including caching, building modified requests, and more.
    const { proto, operationType, frags } ParsedASTType =
      res.locals.parsedAST ?? parseAST(AST);

    // Determine if Quell is able to handle the operation.
    // Quell can handle mutations and queries.

    if (operationType === "unQuellable") {
      /*
       * If the operation is unQuellable (cannot be cached), execute the operation,
       * add the result to the response, and return.
       */
      graphql({ schema: this.schema, source: queryString })
        .then((queryResult): void => {
          res.locals.queryResponse = queryResult;
          return next();
        })
        .catch((error): void => {
          const err = {
            log: `Error inside catch block of operationType === unQuellable of query, ${error}`,
            status: 400,
            message: {
              err: "GraphQL query Error: Check server log for more details.",
            },
          };
          return next(err);
        });
    } else if (operationType === "noID") {
      /*
       * If ID was not included in the query, it will not be included in the cache. Execute the GraphQL
       * operation without writing the result to cache and return.
       */
      // FIXME: Can possibly modify query to ALWAYS have an ID but not necessarily return it back to client
      // unless they also queried for it.
      graphql({ schema: this.schema, source: queryString })
        .then((queryResult) => {
          res.locals.queryResponse = queryResult;
          return next();
        })
        .catch((error) => {
          const err = {
            log: `Error inside catch block of operationType === noID of query, ${error}`,
            status: 400,
            message: {
              err: "GraphQL query Error: Check server log for more details.",
            },
          };
          return next(err);
        });

      /*
       * The code from here to the end of the current if block was left over from a previous
       * implementation and is not currently being used.
       * For the previous implementation: if the ID was not included, used the cache result
       * if the query string was found in the Redis cache. Otherwise, used the result of
       * executing the operation and stored the result in cache.
       */

      // Check Redis for the query string .
      let redisValue: RedisValue = await getFromRedis(
        queryString,
        this.redisCache
      );

      if (redisValue != null) {
        // If the query string is found in Redis, add the result to the response and return.
        redisValue = JSON.parse(redisValue);
        res.locals.queryResponse = redisValue;
        return next();
      } else {
        // Execute the operation, add the result to the response, write the query string and result to cache, and return.
        graphql({ schema: this.schema, source: queryString })
          .then((queryResult) => {
            res.locals.queryResponse = queryResult;
            this.writeToCache(queryString, queryResult);
            return next();
          })
          .catch((error) => {
            const err = {
              log: `Error inside catch block of operationType === noID of query, graphQL query failed, ${error}`,
              status: 400,
              message: {
                err: "GraphQL query Error: Check server log for more details.",
              },
            };
            return next(err);
          });
      }
    } else if (operationType === "mutation") {
      // TODO: If the operation is a mutation, we are currently clearing the cache because it is stale.
      // The goal would be to instead have a normalized cache and update the cache following a mutation.
      this.redisCache.flushAll();
      idCache = {};

      // Determine if the query string is a valid mutation in the schema.
      // Declare variables to store the mutation proto, mutation name, and mutation type.
      let mutationQueryObject;
      let mutationName = "";
      let mutationType = "";
      // Loop through the mutations in the mutationMap.
      for (const mutation in this.mutationMap) {
        // If any mutation from the mutationMap is found on the proto, the query string includes
        // a valid mutation. Update the mutation query object, name, type variables.
        if (Object.prototype.hasOwnProperty.call(proto, mutation)) {
          mutationName = mutation;
          mutationType = this.mutationMap[mutation] as string;
          mutationQueryObject = proto[mutation];
          break;
        }
      }

      // Execute the operation and add the result to the response.
      graphql({ schema: this.schema, source: queryString })
        .then((databaseResponse) => {
          res.locals.queryResponse = databaseResponse;

          // If there is a mutation, update the cache with the response.
          // We don't need to wait until writeToCache is finished.
          if (mutationQueryObject) {
            this.updateCacheByMutation(
              databaseResponse,
              mutationName,
              mutationType,
              mutationQueryObject
            );
          }
          return next();
        })
        .catch((error) => {
          const err = {
            log: `Error inside catch block of operationType === mutation of query, ${error}`,
            status: 400,
            message: {
              err: "GraphQL query (mutation) Error: Check server log for more details.",
            },
          };
          return next(err);
        });
    } else {
      /*
       * Otherwise, the operation type is a query.
       */
      
      // Combine fragments on prototype so we can access fragment values in cache.
      const prototype =
        Object.keys(frags).length > 0
          ? updateProtoWithFragment(proto, frags)
          : proto;
      // Create a list of the keys on prototype that will be passed to buildFromCache.
      const prototypeKeys = Object.keys(prototype);

      // Check the cache for the requested values.
      // buildFromCache will modify the prototype to mark any values not found in the cache
      // so that they may later be retrieved from the database.
      const cacheResponse: {
        data: ItemFromCacheType;
        cached?: boolean;
      } = await this.buildFromCache(prototype, prototypeKeys);
      // Create merged response object to merge the data from the cache and the data from the database.
      let mergedResponse: MergedResponse;

      // Create query object containing the fields that were not found in the cache.
      // This will be used to create a new GraphQL string.
      const queryObject: ProtoObjType = createQueryObj(prototype);

      // If the cached response is incomplete, reformulate query,
      // handoff query, join responses, and cache joined responses.
      if (Object.keys(queryObject).length > 0) {
        // Create a new query string that contains only the fields not found in the cache so that we can
        // request only that information from the database.
        const newQueryString: string = createQueryStr(
          queryObject,
          operationType
        );

        // Execute the query using the new query string.
        graphql({ schema: this.schema, source: newQueryString })
          .then(async (databaseResponseRaw): Promise<void> => {
            // The GraphQL must be parsed in order to join with it with the data retrieved from
            // the cache before sending back to user.
            const databaseResponse = JSON.parse(
              JSON.stringify(databaseResponseRaw)
            );

            // Check if the cache response has any data by iterating over the keys in cache response.
            let cacheHasData = false;

            for (const key in cacheResponse.data) {
              if (Object.keys(cacheResponse.data[key]).length > 0) {
                cacheHasData = true;
              }
            }

            // Create merged response object to merge the data from the cache and the data from the database.
            // If the cache response does not have data then just use the database response.
            mergedResponse = cacheHasData
              ? joinResponses(
                  cacheResponse.data,
                  databaseResponse.data,
                  prototype
                )
              : databaseResponse;

            const currName = "string it should not be again";
            const test = await this.normalizeForCache(
              mergedResponse.data,
              this.queryMap,
              prototype,
              currName
            );
            
            // The response is given a cached key equal to false to indicate to the front end of the demo site that the
            // information was *NOT* entirely found in the cache.
            mergedResponse.cached = false;

            res.locals.queryResponse = { ...mergedResponse };

            return next();
          })
          .catch((error: Error): void => {
            const err = {
              log: `Error inside catch block of operationType === query of query, ${error}`,
              status: 400,
              message: {
                err: "GraphQL query Error: Check server log for more details.",
              },
            };
            return next(err);
          });
      } else {
        // If the query object is empty, there is nothing left to query and we can send the information from cache.
        // The response is given a cached key equal to true to indicate to the front end of the demo site that the
        // information was entirely found in the cache.
        cacheResponse.cached = true;
        res.locals.queryResponse = { ...cacheResponse };
        return next();
      }
    }