const proto1nest = {
  fields: {
    user: {
      $id: '123',
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    },
  },
  fragsDefinitions: {},
  primaryQueryType: 'user',
  fragmentType: '',
  variableValues: {
    user: {
      id: '123',
    },
    address: {
      id: '456',
    },
  },
  operation: 'query',
};

const proto2nest = {
  fields: {
    user: {
      $id: '123',
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      address: {
        $id: '456',
        id: true,
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
    user: {
      userId: '123',
    },
    address: {
      id: '456',
    },
  },
  operation: 'query',
};

const proto3nest = {
  fields: {
    artist: {
      $name: 'Frank Ocean',
      id: '123',
      name: 'pppp',
      albums: {
        id: '456',
        name: 'tree',
        songs: {
          id: '90',
          name: 'nup',
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

const proto = {
    fields: {
      user: {
        $id: '123',
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: {
          $id: '456',
          id: true,
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
      user: {
        userId: '123',
      },
      address: {
        id: '456',
      },
    },
    operation: 'query',
  };

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

const missingCacheKeys2nest = [
    'query:user:123:lastName',
    'query:user:123:email',
    'query:user:123:phoneNumber',
    'query:user:123:address'
  ];


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

  const graphqlResponse = `data: {
      user: {
        id: 123,
        firstName: bun,
        lastName: dl,
        email: bundle@gmail.com,
        phoneNumber: 999-999-999,
        address: {
          id: 234,
          street: 123 codesmith st,
          zip: 92302
          city: LA,
          state: 'CA'
          country: usa,
        }
      }
    }`;

    const queryResults = {
    data: {
        user: {
          id: '123',
          lastName: 'dl',
          email: 'bundle@gmail.com',
          phoneNumber: '999-999-999',
        }
      }
    }



  module.exports = { proto, graphqlResponse2, graphqlResponse1, missingCacheKeys1nest, cacheKeys1nest, proto1nest, proto2nest, proto3nest }

//   const graphQLquery1 = `query {
//     user (id: 123) {
//       id
//       email
//       phoneNumber
//     }`;

// const graphQLquery2 = `query {
//     user (id: 123) {
//       id
//       email
//       phoneNumber
//       address (id: 234) {
//         id
//         state
//         zip
//       }
//       }
//     }`;


