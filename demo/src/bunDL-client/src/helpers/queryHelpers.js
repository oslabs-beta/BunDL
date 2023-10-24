{
  company (id: "6521aebe1882b34d9bc89017") {
    id
    name
    department (id:345) {
      name
      zip
      state
    }
  }
}

// query:user:123:id: 1234
// query:user:123:firstName: 123
// query:user:123:lastName: 444
// query:user:123:extrafield: 444

//LRU Cache
data {
  user (id: 123) {
    id: 123
    firstName: 234
    lastName: 444
  }
}

//check pooch pass in  // query:user:123:FullName
//check pooch id 123 
//check document id 123 fullname, if it exists then update data
//if not, then dont 

data {
  user (id:123) {
    id: 123
    firstName: 234
    lastName: 444
    extrafield: 23344
  }
}

//go to graphql
query {
  user (id:123) {
    fullName
  }
}

//response 

data {
  user (id:123) {
    fullName: shi kuang
  }
}

//merge response

data {
  user (id:123) {
    id: 123
    firstName: 234
    lastName: 444
    extrafield: 23344
    fullName: shi kuang
  }
}

query:user:123:fullName


query{
  user (id:123) {
    id 
    firstName
    lastname
    fullName
  }
}

query:address:345:name
query:address:

data {

  address (345) {
    state
  }
}

data {
  user (id: "6521aebe1882b34d9bc89017") {
    id
    name
    address (id:345) {
      name
      zip

}

const PouchDB = require('pouchdb');
const localDB = new PouchDB('bundl-database');


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


//pouchDB document
//document 1
//artist
//id
//name

//document 2
//album
//id
//name

//document - jSON
//artist
//id
//name
//album {

// if nested queries do not have ids
// query: artist: 123:name
// query: artist: 123:id
// query: artist: 123:albums

// if nested queries have ids
// query: artist:123:name
// query: albums:345:id

//create new schema for every nested objects

//3 schemas for sofa / mongo
//schema for company
//schema for department
//schema for product

//}

const generateMissingPouchDBCachekeys = async (cacheKeys, graphQLcachedata, localDB) => {
  //console.log('thisis result from pouchdb', result)
  //console.log('localDB', localDB)
  //create new arr
  const missingPouchCacheKeys = [];
  //copy graphqlcachedata
  let data = graphQLcachedata.data;
  console.log(data)

  //create empty object to store ids and requested fields
  const docRequests = {};
  console.log('cachekeys', cacheKeys)

  //loop through missing keys
  cacheKeys.forEach((keys) => {
    const key = keys.split(':').slice(0, 3).join(':'); // query:user:$123
    //if object exists with id, push to array as value, if it does not exist, create key value pair with empty arr as value
    if (!docRequests[key]) docRequests[key] = []
    docRequests[key].push(keys.split(':').slice(3).join(''))
  });


  // docRequests = {query:user:$123: [name, city], query:product:$234: [productname, price]}

  for (const key in docRequests) {
    //get typename = 'user'
    const typeName = key.split(':').slice(1, 2).join('');
    //retrieve document from pouchDB with id
    const id = key.split(':').slice(2).join('')
    let doc = await localDB.get(id)

    //if doc exists in pouchdb
    //console.log('pouchdoc', doc)
    if (doc) {
      const fields = docRequests[key];
      fields.forEach((field) => {
        if (doc[field]) {
          data[typeName][field] = doc[field]
        }
        else {
           missingPouchCacheKeys.push(`${key}:${field}`);
        }
      });
    }
    //if doc does not exist in pouchdb
    else {
      const fields = docRequests[id];
      fields.forEach((field) => {
        missingPouchCacheKeys.push(`${key}:${field}`);
      });
    }
  }

  return { updatedgraphQLcachedata, missingPouchCacheKeys };

};

const updatePouchDB = async (updatedCacheKeys, localDB) => {
  //updatedcachekeys = {'query:company:$123:name': 'bundl'}
  // create empty obj
  const obj = {};
  // //loop through missing keys

  for (const keys in updatedCacheKeys) {
    const key = keys.split(':').slice(0, 3).join(':'); // query:company:$123
    const field = keys.split(':').slice(3).join(''); // name
    //check if object has id
    if (!obj[key]) {
      obj[key] = {};
    }
    //update obj[id] with 'field' as key and value from updated cachekeys
    obj[key][field] = updatedCacheKeys[keys];
  }

  //obj = {'query:company:$123': {name:dddd, city:4444, state:444}}

  for (const key in obj) {
    //assign fields to value of obj[key] //example fields = {name:dddd, city:4444, state:444}
    const fields = obj[key];
    //check pouchdb document
    try {
      const id = key.split(':').slice(2).join('')
      //retrieve document frompouch using id
      const doc = await localDB.get(id);
      //if doc exists
      if (doc) {
        //update doc name
        let copy = doc;
        console.log(copy)
        for (const field in fields) {
          copy[field] = fields[field];
        }
        //update fields in current doc
        await localDB.put(doc);
        const results = localDB.get(id)
        return results
      } else {
        //update pouchdb with a new document with id as id, and fields as new fields
        await localDB.put(id, fields);
        const results = localDB.get(id)
        return results
      }
    } catch (err) {
      console.log(err);
    }
  }
};

const updateMissingCache = (queryResults, missingCacheKeys) => {
  const updatedCache = {};
  const data = Object.values(queryResults.data)[0];

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

export {
  generateGraphQLQuery,
  generateMissingLRUCachekeys,
  mergeGraphQLresponses,
  updateMissingCache,
  generateMissingPouchDBCachekeys,
  updatePouchDB,
};
