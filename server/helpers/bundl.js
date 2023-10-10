import { graphql, GraphQLSchema } from 'graphql';
import interceptQueryAndParse from './intercept-and-parse-logic';
import extractAST from './prototype-logic';
import checkCache from './caching-logic';
import { writeToCache } from './redisHelper';
import storeResultsInPouchDB from './pouchdbHelpers';

export default class BunDL {
  constructor(schema, cacheExpiration, redisPort, redisHost) {
    this.schema = schema;
    this.cacheExpiration = cacheExpiration;
    this.redisPort = redisPort;
    this.redisHost = redisHost;
    this.query = this.query.bind(this);
    this.timingData = [];
  }

  // Initialize your class properties here using the parameters

  async query(req, res, next) {
    console.log('hello this is bundle query');
    console.log('this is our request: ', req);
    const { AST, sanitizedQuery, variableValues } =
      await interceptQueryAndParse(req);
    const obj = extractAST(AST, variableValues);
    const { proto, operationType } = obj;
    console.log('proto', proto);

    try {
      if (operationType === 'noBuns') {
        const queryResults = await graphql(this.schema, sanitizedQuery);
        // res.locals.queryResults = queryResults;
        // return next();
        return queryResults;
      } else {
        const results = await checkCache(proto);
        console.log('checkcache results', results);

        if (results) {
          return results;
        } else {
          // console.log(this.schema instanceof GraphQLSchema);

          // console.log('it hits graphql');
          console.log('sanitized query: ', sanitizedQuery);
          const queryResults = await graphql(this.schema, sanitizedQuery);
          const stringifyProto = JSON.stringify(proto);
          await writeToCache(stringifyProto, JSON.stringify(queryResults));
          // console.log('GraphQL Result:', queryResults);
          // console.log('query results: ', queryResults);
          // const storedResults = storeResultsInPouchDB(queryResults);
          return queryResults;
          // this.writeToCache(sanitizedQuery, queryResults);
          // return next();
        }
      }
    } catch (error) {
      console.error('GraphQL Error:', error);
      const err = {
        log: error.message,
        status: 400,
        message: {
          err: 'GraphQL query Error',
        },
      };
      return err;
    }
  }
}
