import redisCacheMain from '../server/src/helpers/redisConnection';
import BunDL from '../middleware/bundl';
import schema from './schema';
import bodyParser from 'body-parser';
import { ur } from '@faker-js/faker';

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
    console.log('the req in /graphql handler is: ', req);
    if (req.method === 'POST') {
      console.log('inside req.method if block');
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
    console.log(req);
    console.log(req.url);
    console.log(req.body);
    const data = await req;
    console.log('data is:', data);

    // const urlPath = new URL(req.url).pathname;
    // if (urlPath === '/graphql' && req.method === 'POST') {
    //   console.log(data);
    //   return bundlCache.query({ body: data }).then((queryResults) => {
    //     return new Response(JSON.stringify(queryResults), { status: 200 });
    //   });
    // }
    const handler = handlers[new URL(req.url).pathname];

    if (handler) {
      console.log('line 69: ', data);
      return handler(req);
    }
    return new Response('This is a 404 error', { status: 404 });
  },
  error(err, req) {
    console.error(err);
    return new Response('An error occurred', { status: 500 });
  },
});
