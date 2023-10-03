  /**
   * Stringifies and writes an item to the cache unless the key indicates that the item is uncacheable.
   * Sets the expiration time for each item written to cache to the expiration time set on server connection.
   * @param {string} key - Unique id under which the cached data will be stored.
   * @param {Object} item - Item to be cached.
   */
  writeToCache(key: string, item: Type | string[] | ExecutionResult): void {
    const lowerKey: string = key.toLowerCase();
    if (!key.includes("uncacheable")) {
      this.redisCache.set(lowerKey, JSON.stringify(item));
      this.redisCache.EXPIRE(lowerKey, this.cacheExpiration);
    }
  }