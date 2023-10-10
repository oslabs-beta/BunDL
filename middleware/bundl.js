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
    //console.log('proto', proto);

    try {
      if (operationType === 'noBuns') {
        const queryResults = await graphql(this.schema, sanitizedQuery);
        res.locals.queryResults = queryResults;
        return next();
      } else {
        const start = performance.now() ;
        const results = await checkCache(proto);
        //console.log('checkcache results', results);
        res.locals.queryResults = results;

        if (results) {
          console.log('cache results exists')
          const end = performance.now() ;
          const speed =  end - start
          res.locals.speed = speed
          console.log('cache exists', 'start', `${start}`, 'end', `${end}`, 'totaltime', `${speed}`)

          //const endcheckCache = performance.now();

          return next();
        } else {
          // console.log(this.schema instanceof GraphQLSchema);
          const queryResults = await graphql(this.schema, sanitizedQuery);
          const stringifyProto = JSON.stringify(proto);
          await writeToCache(stringifyProto, JSON.stringify(queryResults));
          res.locals.queryResults = queryResults;
          const end = performance.now() ;
          const speed =  end - start;
          res.locals.speed = speed
          console.log('from graphql', 'start', `${start}`, 'end', `${end}`, 'totaltime', `${speed}`)
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
