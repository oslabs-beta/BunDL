const generateGraphQLQuery = (keys) => {
  const queryMap = {};

  keys.forEach((key) => {
    const parts = key.split(':');
    const typeName = parts[1];
    const typeID = parts[2];
    const field = parts.slice(3).join(':');

    if (!queryMap[typeName]) {
      queryMap[typeName] = {
        id: typeID,
        fields: [],
      };
    }
    queryMap[typeName].fields.push(field);
  });

  const queries = Object.keys(queryMap).map((typeName) => {
    const type = queryMap[typeName];
    const fields = type.fields.join('\n');
    return `${typeName}(id: "${type.id}") {
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

const generateMissingPouchDBCachekeys = async (cacheKeys, graphQLcachedata, localDB) => {
  const missingPouchCacheKeys = [];
  let data = graphQLcachedata.data;
  const docRequests = {};

  cacheKeys.forEach((keys) => {
    const key = keys.split(':').slice(0, 3).join(':');
    if (!docRequests[key]) docRequests[key] = [];
    docRequests[key].push(keys.split(':').slice(3).join(''));
  });

  for (const key in docRequests) {
    const typeName = key.split(':').slice(1, 2).join('');
    const id = key.split(':').slice(2).join('');

    try {
      let doc = await localDB.get(id);
      if (doc) {
        const fields = docRequests[key];
        fields.forEach((field) => {
          if (doc[field]) {
            data[typeName] = data[typeName] || {};
            data[typeName][field] = doc[field];
          } else {
            missingPouchCacheKeys.push(`${key}:${field}`);
          }
        });
      } else {
        const fields = docRequests[key];
        fields.forEach((field) => {
          missingPouchCacheKeys.push(`${key}:${field}`);
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  const updatedgraphQLcachedata = data;

  return { updatedgraphQLcachedata, missingPouchCacheKeys };
};

const updatePouchDB = async (updatedCacheKeys, localDB) => {
  const obj = {};

  for (const keys in updatedCacheKeys) {
    const key = keys.split(':').slice(0, 3).join(':');
    const field = keys.split(':').slice(3).join('');
    if (!obj[key]) {
      obj[key] = {};
    }
    obj[key][field] = updatedCacheKeys[keys];
  }

  for (const key in obj) {
    const fields = obj[key];
    try {
      const id = key.split(':').slice(2).join('');
      const doc = await localDB.get(id);

      if (doc) {
        let copy = { ...doc };
        for (const field in fields) {
          copy[field] = fields[field];
        }
        await localDB.put(copy);
      } else {
        await localDB.put(id, fields);
      }
    } catch (err) {
      console.log(err);
    }
  }
};

const updateMissingCache = (queryResults, missingCacheKeys) => {
  const updatedCache = {};
  const data = Object.values(queryResults)[0];

  missingCacheKeys.forEach((cacheKey) => {
    const key = cacheKey.split(':');
    const field = key.slice(3);
    field.forEach((eachField) => {
      if (data[eachField]) updatedCache[cacheKey] = data[eachField];
    });
  });

  return updatedCache;
};

const mergeGraphQLresponses = (obj1, obj2) => {
  const merged = { ...obj1 };
  for (const key in obj2) {
    if (typeof obj2[key] === 'object' && obj1[key] && typeof obj1[key] === 'object') {
      merged[key] = mergeGraphQLresponses(obj1[key], obj2[key]);
    } else {
      merged[key] = obj2[key];
    }
  }
  return merged;
};

const generateMissingLRUCachekeys = (cacheKeys, LRUcache) => {
  const organizedKeys = {};
  const graphQLcachedata = {
    data: {},
  };
  const cacheKeysInLRU = LRUcache.keys();
  console.log('cacheKeysInLRU', cacheKeysInLRU);
  console.log(cacheKeys);
  //process the cache keys
  cacheKeys.forEach((key) => {
    // loop through each key and organize them by entity and ID
    // example: query:user:123:name = {user: {123: ['name']}}
    const [_, entityType, entityId, ...fields] = key.split(':');
    // if the entity doesn't exist in our 'organizedKeys' object, then create it
    if (!organizedKeys[entityType]) {
      organizedKeys[entityType] = {};
      console.log('organizedKeys', organizedKeys);
    }
    // create an array for the entityId if it doesn't exist as well
    if (!organizedKeys[entityType][entityId]) {
      organizedKeys[entityType][entityId] = [];
    }
    // append the fields of the current key to the entityId
    organizedKeys[entityType][entityId].push(fields.join(':'));
    console.log('organizedKeys2', organizedKeys);
  });
  //recursively process each entity and its nested entities if they exist to create a GraphQL response structure
  const buildData = (entityType, entityId) => {
    // get the fields associated with this entity and ID
    const fields = organizedKeys[entityType][entityId];
    const resultingValue = { id: entityId };
    // console.log('result', JSON.parse(JSON.stringify(resultingValue)));

    console.log('fields', fields);
    console.log('resultingValue', resultingValue);

    // iterate over each field within the 'entityType' and 'entityId' ('user', '123')
    fields.forEach((field) => {
      // try fetching the value for this field within the LRU cache
      const value = LRUcache.get(`query:${entityType}:${entityId}:${field}`);
      console.log('lruCache: ', value);
      resultingValue[field] = value;
      console.log('result[field]', resultingValue[field]);
    });
    return resultingValue;
  };
  // split the first key and retrieve the top level type (i.e. query:user:123:name = 'user')
  const [_, topLevelEntity] = cacheKeys[0].split(':');
  // grab the ID for the top-level entity
  console.log('organizedKeys[topLevelEntity]', organizedKeys[topLevelEntity]);
  const topLevelEntityId = Object.keys(organizedKeys[topLevelEntity])[0];
  console.log('topLevelEntityId', topLevelEntityId);
  // invoke buildData with 'user' and '123' to recursively process assembling graphQL response data

  graphQLcachedata.data[topLevelEntity] = buildData(topLevelEntity, topLevelEntityId);
  console.log('graphQLcachedata.data[topLevelEntity]', graphQLcachedata.data[topLevelEntity]);
  // check if nested entities haven't been proccessed yet
  Object.keys(organizedKeys).forEach((entityType) => {
    // conditional to ensure that we're not reprocessing the top entity again
    console.log('entityType', entityType);
    if (entityType !== topLevelEntity) {
      const nestedEntityId = Object.keys(organizedKeys[entityType])[0];
      console.log('nestedEntityId', nestedEntityId);
      // conditional to append nested entities to the top level entity
      if (!graphQLcachedata.data[topLevelEntity][entityType]) {
        graphQLcachedata.data[topLevelEntity][entityType] = buildData(entityType, nestedEntityId);
        console.log(
          'graphQLcachedata.data[topLevelEntity][entityType]',
          graphQLcachedata.data[topLevelEntity][entityType]
        );
      }
    }
  });
  // filter out any cache keys that weren't present in the lru cache
  const missingCacheKeys = cacheKeys.filter((key) => !LRUcache.has(key));

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
