import pouchDB from '../server/bun-server';

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

const generateMissingPouchDBCachekeys = async (cacheKeys, graphQLcachedata) => {
  //create new arr
  const missingPouchCacheKeys = [];
  //copy graphqlcachedata
  let data = graphQLcachedata.data;

  //create empty object to store ids and requested fields
  const docRequests = {};

  //loop through missing keys
  cacheKeys.forEach((keys) => {
    const id = keys.split(':').slice(0, 3).join(''); // query:user:$123
    //if object exists with id, push to array as value, if it does not exist, create key value pair with empty arr as value
    docRequests[id]
      ? docRequests.push(keys.split(':').slice(3))
      : (docRequests[id] = []);
  });

  // docRequests = {query:user:$123: [name, city], query:product:$234: [productname, price]}

  for (const id in docRequests) {
    //get typename = 'user'
    const typeName = id.split(':').slice(1, 2).join('');
    //retrieve document from pouchDB with id
    let doc = await pouchDB.get(id);
    //if doc exists in pouchdb
    if (doc) {
      docRequests[id].forEach((field) => {
        //loop through data until find nested field that matches graphqldata
        const updatedData = findGraphQLtypeName(data, doc, field);
        //if data user exists, then update field in user with the value of the doc field
        updatedData
          ? (data = updatedData)
          : missingPouchCacheKeys.push(`${id}:${field}`);
      });
    }
    //if doc does not exist in pouchdb
    else {
      docRequests[id].forEach((field) => {
        missingPouchCacheKeys.push(`${id}:${field}`);
      });
    }
  }

  return { graphQLcachedata, missingPouchCacheKeys };
};

//find field name in graphql query
const findGraphQLtypeName = (data, doc, field) => {
  for (const key in data) {
    if (key === field) {
      data[key] = doc[field];
      return data;
    } else if (typeof data[key] === 'object') {
      data[key] = findGraphQLtypeName(data[key], field);
    }
  }
  return null;
};

const updatePouchDB = async (updatedCacheKeys) => {
  //updatedcachekeys = {'query:company:$123:name': 'bundl'}
  // create empty obj
  const obj = {};
  // //loop through missing keys

  for (const keys in updatedCacheKeys) {
    const id = keys.split(':').slice(0, 3).join(''); // query:company:$123
    const field = keys.split(':').slice(3).join(''); // name
    //check if object has id
    if (!obj[id]) {
      obj[id] = {};
    }
    //update obj[id] with 'field' as key and value from updated cachekeys
    obj[id][field] = updatedCacheKeys[keys];
  }
  //obj = {'query:company:$123': {name:dddd, city:4444, state:444}}

  for (const id in obj) {
    //assign fields to value of obj[id] //example fields = {name:dddd, city:4444, state:444}
    const fields = obj[id];
    //check pouchdb document
    try {
      //retrieve document frompouch using id
      const doc = await pouchDB.get(id);
      //if doc exists
      if (doc) {
        //update doc name
        let copy = doc;
        for (const field in fields) {
          copy[field] = fields[field];
        }
        //update fields in current doc
        await pouchDB.put(doc);
      } else {
        //update pouchdb with a new document with id as id, and fields as new fields
        await pouchDB.put(id, fields);
      }
    } catch (err) {
      console.log(err);
    }
  }
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

const generateMissingLRUCachekeys = (cacheKeys, LRUcache) => {
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
  generateMissingLRUCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
  generateMissingPouchDBCachekeys,
  updatePouchDB,
};
