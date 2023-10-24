import { expect, test, describe, beforeAll, beforeEach } from 'bun:test';
import { graphql } from 'graphql';
import BunCache from './bunCache.js';
import {
  generateGraphQLQuery,
  generateMissingLRUCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
  generateMissingPouchDBCachekeys,
  updatePouchDB,
} from './helpers/queryHelpers';
const PouchDB = require('pouchdb');


describe('1 depth test', () => {
  test.skip('missing cachekeys correctly generated', async () => {
    const newBun = new BunCache();
    const address = {
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
      city: 'LA',
      state: 'CA',
      country: 'usa',
    };
    newBun.cache.set('query:user:123:firstName', 'bun');
    newBun.cache.set('query:user:123:address', address);

    let graphQLresponse = {
      data: {},
    };
    // from proto, what we want to request: graphql request
    const cacheKeys1nest = [
      'query:user:123:firstName',
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address',
    ];

    const missingCacheKeys1nest = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
    ];

    const results = generateMissingLRUCachekeys(cacheKeys1nest, newBun.cache);

    expect(results.missingCacheKeys).toEqual(missingCacheKeys1nest);
  });

  test.skip('graphql response generated from current cache', async () => {
    const newBun = new BunCache();
    const address = {
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
      city: 'LA',
      state: 'CA',
      country: 'usa',
    };
    newBun.cache.set('query:user:123:firstName', 'bun');
    newBun.cache.set('query:user:123:address', address);

    const graphqlResponse2 = {
      data: {
        user: {
          id: '123',
          firstName: 'bun',
          address: {
            id: '234',
            city: 'LA',
            country: 'usa',
            id: '234',
            state: 'CA',
            street: '123 codesmith st',
            zip: '92302',
          },
        },
      },
    };

    const cacheKeys1nest = [
      'query:user:123:firstName',
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address',
    ];

    const results = generateMissingLRUCachekeys(cacheKeys1nest, newBun.cache);

    expect(results.graphQLcachedata).toEqual(graphqlResponse2);
  });

  test.skip('missing POUCHDB cachekeys correctly generated', async () => {

    const localDB = new PouchDB('bundl-database');

    const doc = {
      _id: '123',
      firstName: 'bun',
      lastName: 'dl',
      address: {
        _id: '234',
        city: 'LA',
        country: 'usa',
        id: '234',
        state: 'CA',
        street: '123 codesmith st',
        zip: '92302',
      },
      _rev: "3-22e04404f44864db1cd84369d732f4b5"
    };

    //await localDB.put(doc)

    // from proto, what we want to request: graphql request

    const graphqlcachedata = {
      data: {
        user: {
          _id: '123',
          firstName: 'bun',
        },
      },
    };


    const missingCacheKeys = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address',
    ];

    const missingCacheKeys1nest = [
      'query:user:123:email',
      'query:user:123:phoneNumber',
    ];

    const results = await generateMissingPouchDBCachekeys(
      missingCacheKeys,
      graphqlcachedata,
      localDB
    );
    console.log('results here', results)

    expect(results.missingPouchCacheKeys).toEqual(missingCacheKeys1nest);
  });

  test.skip('missing POUCHDB graphql response correctly generated', async () => {

    const localDB = new PouchDB('bundl-database');

    const doc = {
      _id: '123',
      firstName: 'bun',
      lastName: 'dl',
      address: {
        _id: '234',
        city: 'LA',
        country: 'usa',
        id: '234',
        state: 'CA',
        street: '123 codesmith st',
        zip: '92302',
      },
    };

    //await localDB.put(doc)

    // from proto, what we want to request: graphql request

    const graphQLcachedataresults = {
      data: {
        user: {
          _id: '123',
          firstName: 'bun',
          lastName: 'dl',
          address: {
            _id: '234',
            city: 'LA',
            country: 'usa',
            id: '234',
            state: 'CA',
            street: '123 codesmith st',
            zip: '92302',
          },
        },
      },
    };

    const graphqlcachedata = {
      data: {
        user: {
          _id: '123',
          firstName: 'bun',
        },
      },
    };


    const missingCacheKeys = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address',
    ];

    const missingCacheKeys1nest = [
      'query:user:123:email',
      'query:user:123:phoneNumber',
    ];

    const results = await generateMissingPouchDBCachekeys(
      missingCacheKeys,
      graphqlcachedata,
      localDB
    );
    console.log('results here', results)

    expect(results.graphQLcachedata).toEqual(graphQLcachedataresults);
  });

  test.skip('graphql query from missing cachekeys 1 DEPTH', async () => {
    const newBun = new BunCache();
    const address = {
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
      city: 'LA',
      state: 'CA',
      country: 'usa',
    };
    newBun.cache.set('query:user:123:firstName', 'bun');
    newBun.cache.set('query:user:123:address', address);

    const graphqlquery = `query {
      user (id:123) {
        id
        lastName
        email
        phoneNumber
      }
    }`;

    const missingCacheKeys1nest = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
    ];

    const query = generateGraphQLQuery(missingCacheKeys1nest);

    expect(query.replace(/\s/g, '')).toEqual(graphqlquery.replace(/\s/g, ''));
  });

  test('update pouchdb', async () => {
    const localDB = new PouchDB('bundl-database');
    const doc = {
      _id: 'query:user:123',
      firstName: 'bun',
      lastName: 'dl',
      email: 'bundle@gmail.com',
      phoneNumber: '999-999-999',
      address: {
        _id: '234',
        city: 'LA',
        country: 'usa',
        id: '234',
        state: 'CA',
        street: '123 codesmith st',
        zip: '92302',
      },
    };

    const queryResults = {
      data: {
        user: {
          id: '123',
          email: 'bundle@gmail.com',
          phoneNumber: '999-999-999',
        },
      },
    };

    const updatedCacheKeys = {
      'query:user:123:email': 'bundle@gmail.com',
      'query:user:123:phoneNumber': '999-999-999',
    };

    const results = await updatePouchDB(updatedCacheKeys, localDB);
    expect(results).toEqual(doc);
  });
});

test.skip('update missing cache values', async () => {
  const queryResults = {
    data: {
      user: {
        id: '123',
        lastName: 'dl',
        email: 'bundle@gmail.com',
        phoneNumber: '999-999-999',
        address: {
          id: '234',
          street: '123 codesmith st',
          zip: '92302',
        },
      },
    },
  };

  const missingCacheKeys2nest = [
    'query:user:123:lastName',
    'query:user:123:email',
    'query:user:123:phoneNumber',
    'query:user:123:address',
  ];

  const updatedCacheKeys = {
    'query:user:123:lastName': 'dl',
    'query:user:123:email': 'bundle@gmail.com',
    'query:user:123:phoneNumber': '999-999-999',
    'query:user:123:address': {
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
    },
  };

  const results = updateMissingCache(queryResults, missingCacheKeys2nest);
  expect(results).toEqual(updatedCacheKeys);
});

test.skip('mergeGraphQLresponses', async () => {
  const newBun = new BunCache();

  const graphqlResponse2 = {
    data: {
      user: {
        id: '123',
        email: 'bundle@gmail.com',
        phoneNumber: '999-999-999',
      },
    },
  };

  const graphqlResponse1 = {
    data: {
      user: {
        id: '123',
        firstName: 'bun',
        lastName: 'dl',
        address: {
          id: '234',
          city: 'LA',
          state: 'CA',
          country: 'usa',
        },
      },
    },
  };

  const ExpectedMergedGraphqlResponse = {
    data: {
      user: {
        id: '123',
        firstName: 'bun',
        lastName: 'dl',
        email: 'bundle@gmail.com',
        phoneNumber: '999-999-999',
        address: {
          id: '234',
          city: 'LA',
          state: 'CA',
          country: 'usa',
        },
      },
    },
  };

  const mergedgraphQLresponse = mergeGraphQLresponses(
    graphqlResponse1,
    graphqlResponse2
  );
  expect(mergedgraphQLresponse).toEqual(ExpectedMergedGraphqlResponse);
});
