export class BunDL {
  constructor(
    schema,
    cacheExpiration = 1209600, // Default expiry time is 14 days
    costParameters = defaultCostParams,
    redisPort,
    redisHost,
    redisPassword
  ) {}

  async query(req, res, next) {
    const { proto, operationType } = await extractAST(AST);

    const prototype = proto;

    if (operationType === 'noBuns') {
      graphql(this.schema, sanitizedQuery)
        .then((queryResults) => {
          res.locals.queryResults = queryResults;
          return next();
        })
        .catch((error) => {
          const err = {
            log: 'rip',
            status: 400,
            message: {
              err: 'GraphQL query Error',
            },
          };
          return next(err);
        });
    } else {
      graphql(this.schema, sanitizedQuery)
        .then((queryResults) => {
          res.locals.queryResults = queryResults;
          this.writeToCache(sanitizedQuery, queryResults);
          return next();
        })
        .catch((error) => {
          const err = {
            log: 'rip again',
            status: 400,
            message: {
              err: 'GraphQL query Error',
            },
          };
          return next(err);
        });
    }
  }
}
