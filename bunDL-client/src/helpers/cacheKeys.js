const generateCacheKeys = (proto) => {
  let resultKeys = [];

  const { fields, operation, variableValues } = proto;

  // Helper function to traverse nested fields
  const traverseFields = (fields, primaryType) => {
    for (const [field, value] of Object.entries(fields)) {
      // Check if it's a nested field and inspect the first key
      const firstKey = Object.keys(value)[0];
      if (typeof value === 'object' && firstKey && firstKey.startsWith('$')) {
        // recursively call the nested fields
        // this will also set the new primaryType to be the field
        traverseFields(value, field);
      } else if (value === true) {
        // use the id to set the primaryType
        const idValue = variableValues[primaryType].id;
        // store the path into the resultKeys variable
        resultKeys.push(`${operation}:${primaryType}:$${idValue}:${field}`);
      }
    }
  };

  traverseFields(fields[proto.primaryQueryType], proto.primaryQueryType);

  return resultKeys;
};

// function to store keys
const storeCacheKeys = (results, keys) => {
  keys.forEach((key) => {
    const splitKey = key.split(':');
    const segmentedKey = splitKey.slice(1);
    let data = results.data;
    for (const eachElement of segmentedKey) {
      data = data[eachElement];
      if (!data) break;
    }
    this.set(key, data);
  });
};

export { generateCacheKeys, storeCacheKeys };
