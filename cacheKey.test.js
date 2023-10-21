import { generateCacheKeys } from './bunDL-client/src/helpers/cacheKeys.js';
import { expect, test, describe } from 'bun:test';

describe('generateCacheKeys function', () => {
  test('should generate correct cache keys from given proto', () => {
    // const proto = {
    //   fields: {
    //     user: {
    //       $id: 'userId',
    //       id: true,
    //       firstName: true,
    //       lastName: true,
    //       email: true,
    //       phoneNumber: true,
    //       address: {
    //         $id: '456',
    //         id: true,
    //         street: true,
    //         city: true,
    //         state: true,
    //         zip: true,
    //         country: true,
    //       },
    //     },
    //   },
    //   fragsDefinitions: {},
    //   primaryQueryType: 'user',
    //   fragmentType: '',
    //   variableValues: {
    //     user: {
    //       userId: '123',
    //     },
    //     address: {
    //       id: '456',
    //     },
    //   },
    //   operation: 'query',
    // };

    const proto = {
      fields: {
        artist: {
          $name: 'Frank Ocean',
          id: true,
          name: true,
          albums: {
            id: true,
            name: true,
            songs: {
              id: true,
              name: true,
            },
          },
        },
      },
      fragsDefinitions: {},
      primaryQueryType: 'artist',
      fragmentType: '',
      variableValues: {
        artist: {
          name: 'Frank Ocean',
        },
      },
      operation: 'query',
    };

    const expectedKeys = [
      'query:user:$id',
      'query:user:$id:firstName',
      'query:user:$id:lastName',
      'query:user:$id:email',
      'query:user:$id:phoneNumber',
      'query:address:$id',
      'query:address:$id:street',
      'query:address:$id:city',
      'query:address:$id:state',
      'query:address:$id:zip',
      'query:address:$id:country',
    ];

    const resultKeys = generateCacheKeys(proto);
    console.log(resultKeys);
    expect(resultKeys).toEqual(expectedKeys);
  });
});
