import { parse } from 'graphql';
import extractAST from './bunDL-client/src/helpers/extractAST.js';
// import { parseAST } from './bunDL-client/src/helpers/parseAST.js';
import { expect, test, describe } from 'bun:test';

describe('extractAST function', () => {
  test('should correctly extract operationType from a simple query', () => {
    const sampleAST = parse(`
          query {
            artist {
                id
                name
                albums {
                    id
                    name
                }
            }
        }
          `);

    const { proto, operationType } = extractAST(sampleAST, {
      cacheMetadata: false,
      cacheVariables: true,
      requireArguments: true,
    });

    // console.log(JSON.stringify(proto, null, 2));
    expect(operationType).toBe('noArguments');
  });

  // need to add testing directives, variables, fragment spreads, inline fragments, etc.

  test('should handle fields with aliases if cacheMetadata is false', () => {
    const sampleAST = parse(`
    {
      user (id: 123) {
        id
        firstName: name
        address {
          id
          street
          city
        }
      }
    }
    `);

    const result = extractAST(sampleAST, {
      cacheMetadata: true,
      cacheVariables: true,
    });

    // console.log(JSON.stringify(result, null, 2));
    expect(result.proto.fields.user.firstName.subdata.name).toBe('name');
    expect(result.proto.fields.user.firstName.subdata.alias).toBe('firstName');
  });
});

test('should handle fields without metadata', () => {
  const sampleAST = parse(
    `{
    user (id: "6521aebe1882b34d9bc89017"){
      id
      firstName: name
      address {
        id
        street
        city
      }
    }
  }`
  );

  const result = extractAST(sampleAST, {
    cacheMetadata: false,
    cacheVariables: true,
    requireIdArg: true,
  });

  // console.log(JSON.stringify(result, null, 2));
  expect(result.proto.fields.user.firstName).toBe(true);
  expect(result.proto.fields.user.address.street).toBe(true);
});

test('should handle arguments', () => {
  const sampleAST = parse(
    `{
      user (id: "6521aebe1882b34d9bc89017") {
        id
        firstName
        lastName
        email
        phoneNumber
        address (id: "123") {
          street
          city
          state
          zip
          country
        }
      }
    }`
  );

  const result = extractAST(sampleAST, {
    cacheVariables: true,
    requireArguments: true,
  });

  console.log(JSON.stringify(result, null, 2));
  expect(result.proto.fields.user.$id).toBe('6521aebe1882b34d9bc89017');
});

test('should handle dynamic variables', () => {
  const sampleAST = parse(
    `query ($userId: String) {
        user (id: $userId) {
        id
        firstName
        lastName
        email
        phoneNumber
        address (id: 456) {
          id
          street
          city
          state
          zip
          country
        }
      }
    }`
  );

  // Variable values object
  const variables = {
    // Fake value for $userId variable
    userId: '123',
  };
  const { proto, operationType } = extractAST(
    sampleAST,
    {
      cacheMetadata: true,
      cacheVariables: true,
    },
    variables
  );
  // console.log(JSON.stringify(proto, null, 2));
  expect(proto.variableValues.user.userId).toBe('123');
});

test('should handle directives', () => {
  const sampleAST = parse(`
  {
    user @client {
      id
      name
    }
  }
  `);

  const { proto, operationType } = extractAST(sampleAST, {
    cacheMetadata: true,
    cacheVariables: true,
  });

  // console.log(JSON.stringify(proto, null, 2));
  expect(operationType).toBe('noBuns');
});

test('should handle fragment spreads', () => {
  const sampleAST = parse(`

  {
    user {
      ...userInfo
      address {
        id
        street
      }
    }
  }

  fragment userInfo on User {
    id
    name
  }
  `);

  const { proto, operationType } = extractAST(sampleAST, {
    cacheMetadata: false,
    cacheVariables: true,
  });

  // console.log(JSON.stringify(proto, null, 2));
  expect(proto.fields.user.name).toBe(true);
  expect(proto.fields.user.id).toBe(true);
});

test('should correctly identify requireArguments to be false', () => {
  const sampleAST = parse(`
  {
    users {
      name
      age
    }
  }
  `);

  const { proto, operationType } = extractAST(sampleAST, {
    cacheMetadata: false,
    cacheVariables: true,
    requireArguments: false,
  });

  console.log(JSON.stringify(proto, null, 2));
  // console.log(operationType);
  expect(operationType).toBe('query');
});

test('should handle subscription queries', () => {
  const sampleAST = parse(`
  subscription {
    userAdded {
      id
      name
    }
  }
  `);

  const { proto, operationType } = extractAST(sampleAST, {
    cacheMetadata: true,
    cacheVariables: true,
  });

  // console.log(JSON.stringify(proto, null, 2));
  expect(operationType).toBe('noBuns');
});

test('should require arguments', () => {
  const sampleAST = parse(`
  {
    users {
      id
      name
      age
    }
  }
  `);

  const { proto, operationType } = extractAST(sampleAST, {
    cacheMetadata: false,
    cacheVariables: true,
    requireArguments: true,
  });
  // console.log(JSON.stringify(proto, null, 2));
  expect(operationType).toBe('noArguments');
});
