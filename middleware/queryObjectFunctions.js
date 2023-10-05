const recreateQueryForDatabase = (proto) => {
  const dbQueryObj = {};
  for (const key in proto) {
    const reducedProto = this.toggleProtoFieldsToFalse(proto[key]);
  }
};

const toggleProtoFieldsToFalse = (proto) => {};

const convertQueryObjectToString = (queryObject) => {};

const stringifyQuery = (fieldsArray) => {};

module.exports = {
  recreateQueryForDatabase,
  toggleProtoFieldsToFalse,
  convertQueryObjectToString,
  stringifyQuery,
};
