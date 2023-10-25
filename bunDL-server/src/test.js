if (operationType === 'noBuns') {
  console.log('1');
  const queryResults = await graphql(this.schema, sanitizedQuery);
  return queryResults;
} else {
  console.log('2');
  let redisData = await this.redisCache.json_get(redisKey);
  if (redisData) {
    console.log('3');
    return this.handleCacheHit(proto, redisData, start);
  } else if (!redisKey) {
    console.log('4');
    const queryResults = await graphql(this.schema, sanitizedQuery);
    console.error(queryResults);
    const stored = this.storeDocuments(queryResults.data.users);
    return queryResults;
  } else {
    console.log('5');
    return this.handleCacheMiss(proto, start, redisKey);
  }
}
