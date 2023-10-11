import fs from 'fs';
import path from 'path';
import redisCacheMain from '../bunDL-server/src/helpers/redisConnection.js';
import BundlServer from '../bunDL-server/src/bundl';
import BundlClient from '../bunDL-client/src/bunCache';
import schema from './schema';
import { BasicAuthenticator } from 'ibm-cloud-sdk-core';
require('dotenv').config();
// const { faker } = require('@faker-js/faker');

const pouchdb = require('pouchdb');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const vcapLocal = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../vcap-local.json'), 'utf8')
);
// const populateDB = require('../fakeData.js');

const cloudantCredentials = vcapLocal.services.cloudantnosqldb.credentials;
const authenticator = new BasicAuthenticator({
  username: cloudantCredentials.username,
  password: cloudantCredentials.password,
});

const service = new CloudantV1({
  authenticator: authenticator,
});

service.setServiceUrl(process.env.URL);

service
  .getMembershipInformation()
  .then((info) => {
    // console.log('Membership info: ', info);
  })
  .catch((err) => {
    console.error('Error connecting to Cloudant:', err);
    console.error('Stack: ', err.stack);
  });

const db = new pouchdb('bundl-database');
const pouchURL = cloudantCredentials.url;
const remoteDB = new pouchdb(`${pouchURL}/bundl-test`, {
  auth: {
    username: cloudantCredentials.username,
    password: cloudantCredentials.password,
  },
});

const sync = db.sync(remoteDB, { live: true });
db.info().then(function (info) {
  console.log('local DB info: ', info);
});

sync.on('error', function (err) {
  console.error('Sync Error', err);
});

remoteDB.info().then(function (info) {
  console.log('remote DB info: ', info);
});

// populateDB(db, 100);

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
