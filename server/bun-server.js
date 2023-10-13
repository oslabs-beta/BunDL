import redisCacheMain from '../bunDL-server/src/helpers/redisConnection.js';
import BundlServer from '../bunDL-server/src/bundl';
import BundlClient from '../bunDL-client/src/bunCache';
import {schema} from './schema';
import path from 'path';
//import updateDashboardMetrics from '../bunDL-server/src/helpers/updateDashboardMetrics';


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
} = require('../bunDL-server/src/helpers/redisHelper.js');

const bunDLClient = new BundlClient(schema);

const bunDLServer = new BundlServer(
  schema,
  3600,
  redisCacheMain.redisPort,
  redisCacheMain.redisHost
);

const BASE_PATH = path.join(__dirname, '../front-end/public/');

const handlers = {
  '/': async (req) => {
    try {
      const filePath = BASE_PATH + new URL(req.url).pathname;
      const file = await Bun.file(filePath + 'index.html');
      return new Response(file);
    } catch {
      (err) => new Response('File not found', { status: 404 });
    }
  },
  '/graphql': (req) => {
    if (req.method === 'POST') {
      return bunDLServer.query(req).then((queryResults) => {
        // uncomment the above or below line depending on which middleware you want to test (bundlServer vs bunDLClient)
        // return bunDLClient.query(req).then((queryResults) => {
        return new Response(JSON.stringify(queryResults), { status: 200 });
      });
    }
  },
  '/api/query': async (req) => {
    if (req.method === 'POST') {
      return bunDLServer.query(req).then((data) => {
        console.log('speeeeeed', data.cachedata);
        return new Response(JSON.stringify(data.cachedata), {
          status: 200,
        });
      });
    }
  },


  '/api/clearCache': async (req) => {
    if (req.method === 'GET') {
      return bunDLServer.clearRedisCache(req)
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
    //const data = await req;
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
