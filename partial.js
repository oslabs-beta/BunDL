const generateMissingLRUCachekeys = (cacheKeys, LRUcache) => {
  const organizedKeys = {};
  let relationships = {};

  //process the cache keys
  cacheKeys.forEach((key) => {
    // loop through each key and organize them by entity and ID
    // example: query:user:123:name = {user: {123: ['name']}}
    const [_, entityType, entityId, ...fields] = key.split(':');
    // if the entity doesn't exist in our 'organizedKeys' object, then create it
    if (!organizedKeys[entityType]) {
      organizedKeys[entityType] = {};
    }
    // create an array for the entityId if it doesn't exist as well
    if (!organizedKeys[entityType][entityId]) {
      organizedKeys[entityType][entityId] = [];
    }
    // append the fields of the current key to the entityId
    organizedKeys[entityType][entityId].push(fields.join(':'));

    // cacheKeys.forEach((innerKey) => {
    //   if (innerKey.includes(`:${entityType}:`) && key !== innerKey) {
    //     const parentEntity = innerKey.split(':')[1];
    //     relationships[parentEntity] = entityType;
    //   }
    // });
  });

  //recursively process each entity and its nested entities if they exist to create a GraphQL response structure
  const buildData = (entityType, entityId) => {
    // get the fields associated with this entity and ID
    const fields = organizedKeys[entityType][entityId];
    const result = { id: entityId };

    // iterate over each field within the 'entityType' and 'entityId' ('user', '123')
    fields.forEach((field) => {
      // try fetching the value for this field within the LRU cache
      const value = LRUcache.get(`query:${entityType}:${entityId}:${field}`);

      // check if the field also exists within 'organizedKeys'
      if (field === relationships[entityType] && organizedKeys[field]) {
        // if so, the field is actually a reference to another entity
        const nestedEntityId = Object.keys(organizedKeys[field])[0];
        // start another recursion by processing the data for the nested entity
        result[field] = buildData(field, nestedEntityId);
      } else {
        result[field] = value;
      }
    });
    return result;
  };

  const graphQLcachedata = {
    data: {},
  };

  // split the first key and retrieve the top level type (i.e. query:user:123:name = 'user')
  const [_, topLevelEntity] = cacheKeys[0].split(':');
  // grab the ID for the top-level entity
  const topLevelEntityId = Object.keys(organizedKeys[topLevelEntity])[0];
  // invoke buildData with 'user' and '123' to recursively process assembling graphQL response data
  graphQLcachedata.data[topLevelEntity] = buildData(topLevelEntity, topLevelEntityId);
  // check if nested entities haven't been proccessed yet
  Object.keys(organizedKeys).forEach((entityType) => {
    // conditional to ensure that we're not reprocessing the top entity again
    if (entityType !== topLevelEntity) {
      const nestedEntityId = Object.keys(organizedKeys[entityType])[0];
      // conditional to append nested entities to the top level entity
      if (!graphQLcachedata.data[topLevelEntity][entityType]) {
        graphQLcachedata.data[topLevelEntity][entityType] = buildData(entityType, nestedEntityId);
      }
    }
  });
  // filter out any cache keys that weren't present in the lru cache
  const missingCacheKeys = cacheKeys.filter((key) => !LRUcache.has(key));

  // Return the missing cache keys and the updated GraphQL data
  return { missingCacheKeys, graphQLcachedata };
};

const cacheKeys = [
  'query:company:company1:company',
  'query:company:company1:name',
  'query:department:department1:departmentName',
];

const LRUcache = new Map();
LRUcache.set('query:company:company1:company', 'ABC Corp');
LRUcache.set('query:department:department1:departmentName', 'Finance');
LRUcache.set('query:company:company1:name', 'ABC');

console.log(generateMissingLRUCachekeys(cacheKeys, LRUcache));
