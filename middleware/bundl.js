import { graphql } from 'graphql';
import interceptQueryAndParse from './intercept-and-parse-logic';
import extractAST from './prototype-logic';
import checkCache from './caching-logic';

export default class BunDL {
  constructor(schema, cacheExpiration, redisPort, redisHost) {
    this.schema = schema;
    this.cacheExpiration = cacheExpiration;
    this.redisPort = redisPort;
    this.redisHost = redisHost;
    this.query = this.query.bind(this);
  }

  // Initialize your class properties here using the parameters

  async query(req, res, next) {
    //console.log('this schema', this.schema);
    console.log('hello this is bundle query');
    const { AST, sanitizedQuery } = interceptQueryAndParse(req);
    const obj = extractAST(AST);
    const { proto, operationType } = obj;
    console.log('proto', proto);

    try {
      if (operationType === 'noBuns') {
        graphql(this.schema, sanitizedQuery)
          .then((queryResults) => {
            //res.locals.queryResults = queryResults;
            //return next();
            return queryResults;
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
        const results = await checkCache(proto);
        console.log('checkcache results', results);
        if (results) {
          res.locals.queryResults = results;
          return next();
        } else {
          console.log('it hits graphql');
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
    } catch (err) {
      console.log(err);
    }
  }
}
