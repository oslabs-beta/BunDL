const generateGraphQLQuery = (keys) => {
  const queryMap = {};

  // Loop through the keys to build the query map
  keys.forEach((key) => {
    const parts = key.split(':');
    const typeName = parts[1];
    const typeID = parts[2];
    const field = parts.slice(3).join(':');
    console.log(field);

    if (!queryMap[typeName]) {
      queryMap[typeName] = {
        id: typeID,
        fields: [],
      };
    }
    // user = {
    //   id: '123'
    //   fields: [id, lastname, email, phonenumber]
    // }
    // address = {
    //id
    //fields [street, etc...]
    //}

    queryMap[typeName].fields.push(field);
  });

  // Generate the GraphQL query
  const queries = Object.keys(queryMap).map((typeName) => {
    const type = queryMap[typeName];
    const fields = type.fields.join('\n');
    return `${typeName}(id: ${type.id}) {
        id
        ${fields}
    }`;
  });

  let query = `query {
      ${queries.join('\n')}
  `;

  for (const keys in queryMap) {
    query += '}';
  }

  return query;
};

const updateMissingCache = (queryResults, missingCacheKeys) => {
  const updatedCache = {};
  const data = Object.values(queryResults.data)[0];
  // data = {
  //   id: '123',
  //   lastName: 'dl',
  //   email: 'bundle@gmail.com',
  //   phoneNumber: '999-999-999',
  //   address: {
  //     id: '234',
  //     street: '123 codesmith st',
  //     zip: '92302',
  //   },
  // }
  missingCacheKeys.forEach((cacheKey) => {
    const key = cacheKey.split(':');
    const field = key.slice(3);
    console.log('field', field);
    field.forEach((eachField) => {
      if (data[eachField]) updatedCache[cacheKey] = data[eachField];
      // lastname: 'dl'
    });
  });

  return updatedCache;
};

const mergeGraphQLresponses = (obj1, obj2) => {
  const merged = { ...obj1 };

  for (const key in obj2) {
    if (
      typeof obj2[key] === 'object' &&
      obj1[key] &&
      typeof obj1[key] === 'object'
    ) {
      merged[key] = mergeGraphQLresponses(obj1[key], obj2[key]);
    } else {
      merged[key] = obj2[key];
    }
  }
  return merged;
};

const generateMissingCachekeys = (cacheKeys, LRUcache) => {
  // Initialize an array to track missing cache keys
  const missingCacheKeys = [];

  const graphQLcachedata = {
    data: {},
  };

  // Loop through the cacheKeys
  cacheKeys.forEach((key) => {
    // Check if the cache key exists in the LRU cache
    if (!LRUcache.has(key)) {
      missingCacheKeys.push(key);
    } else {
      // Split the key into parts
      // query: user: 123: name: age = > ['query', 'user', '123' 'name', 'age']
      const fieldKey = key.split(':');
      const typeName = fieldKey[1];
      const fields = fieldKey.slice(3); // ['name', 'age']
      // name = {
      //age: 4
      //}

      // Create a reference to the current data object
      // graphqlcachedata = {
      //   data {
      //     user {
      //       id: LRUcache id
      //       name: LRUcache name
      //     }
      //   }
      // }
      let data = graphQLcachedata.data;
      if (!graphQLcachedata.data[typeName]) {
        graphQLcachedata.data[typeName] = {};
      }

      if (!graphQLcachedata.data[typeName].id)
        graphQLcachedata.data[typeName].id = fieldKey[2];

      // Loop through the fields and create the nested structure
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        //console.log(field)
        if (i === fields.length - 1) {
          // If it's the last field, assign the value from the LRU cache
          data[typeName][field] = LRUcache.get(key);
          //data[user][name] = value of this ['query:user:123:name'] in LRU cache
          // data {
          //   user {
          //     name: LRUcache.get(key)
          //   }
          // }
          //console.log('first field',data)
        } else {
          // Otherwise, create a nested object if it doesn't exist
          if (!data[typeName][field]) {
            data[typeName][field] = {};
          }
          // Move the data reference to the next level
          data = data[typeName][field];
          //['query', 'user', '123' 'name', 'age', 'location']
          //data => data[user][name]
        }
      }
    }
  });

  // Return the missing cache keys and the updated GraphQL data
  return { missingCacheKeys, graphQLcachedata };
};

module.exports = {
  generateGraphQLQuery,
  generateMissingCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
};
