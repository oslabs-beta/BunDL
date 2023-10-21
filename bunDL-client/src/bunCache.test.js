import { expect, test, describe, beforeAll, beforeEach } from 'bun:test';
import BunCache from './bunCache.js';
import {
  generateGraphQLQuery,
  generateMissingCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
} from './helpers/queryHelpers';

describe('1 depth test', () => {
  test('missing cachekeys correctly generated', async () => {
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
    const cacheKeys1nest= [
      'query:user:123:firstName',
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address'
    ];

    const missingCacheKeys1nest = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
    ];

    const results = generateMissingCachekeys(
      cacheKeys1nest,
      newBun.cache
    );

    expect(results.missingCacheKeys).toEqual(missingCacheKeys1nest);
  });


  test('graphql response generated from current cache', async () => {
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
            city: "LA",
            country: "usa",
            id: "234",
            state: "CA",
            street: "123 codesmith st",
            zip: "92302"
            },
        },
      },
    };

    const cacheKeys1nest= [
      'query:user:123:firstName',
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address'
    ];

    const results = generateMissingCachekeys(cacheKeys1nest, newBun.cache);

    expect(results.graphQLcachedata).toEqual(graphqlResponse2);
  });

  test('graphql query from missing cachekeys 1 DEPTH', async () => {
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

    const graphqlquery =
    `query {
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

  test('update missing cache values', async () => {
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
});

test('mergeGraphQLresponses', async () => {
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

  const mergedgraphQLresponse = mergeGraphQLresponses(graphqlResponse1, graphqlResponse2);
  expect(mergedgraphQLresponse).toEqual(ExpectedMergedGraphqlResponse);
});


describe('2 depth test', () => {
  test('missing cachekeys correctly generated', async () => {
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
    const cacheKeys1nest= [
      'query:user:123:firstName',
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address'
    ];

    const missingCacheKeys1nest = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
    ];

    const results = generateMissingCachekeys(
      cacheKeys1nest,
      newBun.cache
    );

    expect(results.missingCacheKeys).toEqual(missingCacheKeys1nest);
  });


  test('graphql response generated from current cache', async () => {
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
            city: "LA",
            country: "usa",
            id: "234",
            state: "CA",
            street: "123 codesmith st",
            zip: "92302"
            },
        },
      },
    };

    const cacheKeys1nest= [
      'query:user:123:firstName',
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:user:123:address'
    ];

    const results = generateMissingCachekeys(cacheKeys1nest, newBun.cache);

    expect(results.graphQLcachedata).toEqual(graphqlResponse2);
  });

  test('graphql query from missing cachekeys 2 DEPTH', async () => {
    const newBun = new BunCache();
    const address = [{
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
      country: 'usa',
    },
    {
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
      country: 'usa',
    },
    {
      id: '234',
      street: '123 codesmith st',
      zip: '92302',
      country: 'usa',
    }];
    //query:user:123:address:234
    newBun.cache.set('query:user:123:firstName', 'bun');
    newBun.cache.set('query:address:234:street', '123 codesmith st');
    newBun.cache.set('query:address:234:zip', '92302');
    newBun.cache.set('query:address:234:country', 'usa');



    //NO LRU CACHE - KEY DOES NOT EXIST // IF ID DOES NOT EXIST IN NESTED QUERIES, GO TO DATABASE, DO NOT SAVE IN LRU CACHE
    //query:user:123:address = [{address1}, {address2}..etc]    //match fields with schema
    //query:user:123:address:city = [{city1}, {city2}]
    //query:address:567:city = [{city1}, {city2}] //check if city is an object
    //query:address:567:city:345:name - city will be nested if have multiple city data

    //CACHE
    //query:user:123:lastname
    //query:user:123:email
    //query:address:567 = address567
    //query:address:567:state
    //query:household:789
    //query:household:789:name

    //arguments: id: 123

    //NEEDS ID TO BE IN LRU CACHE
    const graphqlquery2 = 'query {address (id: 567) {city state zip country}}'
    const graphqlquery =
    `query {
      user (id:123) {
        id
        lastName
        email
        phoneNumber
        address (id: 567) {
          city {
          state
          zip
          country
          household (id:789) {
            name
          }
        }
      }
    }`;

    const missingCacheKeys2nest = [
      'query:user:123:lastName',
      'query:user:123:email',
      'query:user:123:phoneNumber',
      'query:address:234:city',
      'query:address:234:state',
    ];

    const query = generateGraphQLQuery(missingCacheKeys2nest);

    expect(query.replace(/\s/g, '')).toEqual(graphqlquery.replace(/\s/g, ''));
  });

  test('graphql query from missing cachekeys 1 DEPTH', async () => {
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

    const graphqlquery =
    `query {
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

  test('update missing cache values', async () => {
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
});

test('mergeGraphQLresponses', async () => {
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

  const mergedgraphQLresponse = mergeGraphQLresponses(graphqlResponse1, graphqlResponse2);
  expect(mergedgraphQLresponse).toEqual(ExpectedMergedGraphqlResponse);
});



