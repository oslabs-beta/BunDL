import { generateCacheKeys } from './bunDL-client/src/helpers/cacheKeys.js';
import { expect, test, describe } from 'bun:test';

describe('generateCacheKeys function', () => {
  test('should generate correct cache keys from given proto', () => {
    const proto = {
      fields: {
        user: {
          $id: 'userId',
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          address: {
            street: true,
            city: true,
            state: true,
            zip: true,
            country: true,
          },
        },
      },
      fragsDefinitions: {},
      primaryQueryType: 'user',
      fragmentType: '',
      variableValues: {
        userId: 'userId',
      },
      operation: 'query',
    };

    const expectedKeys = [
      'query:user:$id',
      'query:user:id',
      'query:user:firstName',
      'query:user:lastName',
      'query:user:email',
      'query:user:phoneNumber',
      'query:user:address',
      'query:user:address:street',
      'query:user:address:city',
      'query:user:address:state',
      'query:user:address:zip',
      'query:user:address:country',
    ];

    'query:user:address' : 
    
    data {
      street : 
      city : 
      state : 
      zip : 
      country : 
    }

    const resultKeys = generateCacheKeys(proto);
    console.log(resultKeys);
    expect(resultKeys).toEqual(expectedKeys);
  });
});
