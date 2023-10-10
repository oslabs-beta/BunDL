import redisCacheMain from './helpers/redisConnection.js';
import BunDL from './helpers/bundl';
import schema from './schema';

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
} = require('./helpers/redisHelper');

const bundlCache = new BunDL(
  schema,
  3600,
  redisCacheMain.redisPort,
  redisCacheMain.redisHost
);

const BASE_PATH = '/Users/andrew/codesmith/bunDL/BunDL/front-end/public/';

const handlers = {
  '/': async (req) => {
    try {
      // console.log(req);
      // console.log(Bun.main);
      const filePath = BASE_PATH + new URL(req.url).pathname;
      const file = await Bun.file(filePath + 'index.html');
      return new Response(file);
    } catch {
      (err) => new Response('File not found', { status: 404 });
    }
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
  async fetch(req) {
    const data = await req;

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