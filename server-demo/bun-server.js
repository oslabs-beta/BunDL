import redisCacheMain from '../server/src/helpers/redisConnection';
import BunDL from '../middleware/bundl';
import schema from './schema';
import bodyParser from 'body-parser';

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
} = require('graphql');

const {
  getRedisInfo,
  getRedisKeys,
  getRedisValues,
} = require('../server/src/helpers/redisHelper');

const bundlCache = new BunDL(
  schema,
  3600,
  redisCacheMain.redisPort,
  redisCacheMain.redisHost
);

const handlers = {
  '/': (req) => {
    return new Response(Bun.file('../front-end/front-end/public/index.html'))
      .then(
        (contents) =>
          new Response(contents, { headers: { 'Content-Type': 'text/html' } })
      )
      .catch((err) => new Response('File not found', { status: 404 }));
  },
  '/graphql': (req) => {
    if (req.method === 'POST') {
      return bundlCache.query(req).then((queryResults) => {
        return new Response(JSON.stringify(queryResults), { status: 200 });
      });
    }
  },
  '/test': (req) => {
    return new Response('🚀 You found me! 🚀');
  },
};

Bun.serve({
  hostname: 'localhost',
  port: 3000,
  fetch(req) {
    const handler = handlers[new URL(req.url).pathname];
    if (handler) {
      return handler(req);
    }
    return new Response('This is a 404 error', { status: 404 });
  },
  error(err, req) {
    console.error(err);
    return new Response('An error occurred', { status: 500 });
  },
});
