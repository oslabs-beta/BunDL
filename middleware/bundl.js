import { graphql, GraphQLSchema } from 'graphql';
import interceptQueryAndParse from './intercept-and-parse-logic';
import extractAST from './prototype-logic';
import checkCache from './caching-logic';
import { writeToCache } from '../server/src/helpers/redisHelper';

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
    console.log('hello this is bundle query');

    const { AST, sanitizedQuery, variableValues } = interceptQueryAndParse(req);
    const obj = extractAST(AST, variableValues);
    const { proto, operationType } = obj;
    console.log('proto', proto);

    try {
      if (operationType === 'noBuns') {
        const queryResults = await graphql(this.schema, sanitizedQuery);
        res.locals.queryResults = queryResults;
        return next();
      } else {
        const startcheckCache = performance.now();
        const results = await checkCache(proto);
        const endcheckCache = performance.now();
        const speedCache = startcheckCache - endcheckCache
        console.log('check cache speed', 'start', `${startgraphql}`, 'end', `${endgraphql}`, 'totaltime', `${speedgraphql}`)

        console.log('checkcache results', results);

        if (results) {
          const speed = performance.now()
          console.log('speed redis', speed)
          res.locals.queryResults = results;
          return next();
        } else {
          // console.log(this.schema instanceof GraphQLSchema);


          console.log('it hits graphql');
          const queryResults = await graphql(this.schema, sanitizedQuery);
          console.log('GraphQL Result:', queryResults);
          const stringifyProto = JSON.stringify(proto);
          await writeToCache(stringifyProto, JSON.stringify(queryResults));

          res.locals.queryResults = queryResults;
          // this.writeToCache(sanitizedQuery, queryResults);
          return next();
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
      return next(err);
    }
  }
}
