  /**
   * Removes key-value from the cache unless the key indicates that the item is not available.
   * @param {string} key - Unique id under which the cached data is stored that needs to be removed.
   */
  async deleteCacheById(key: string) {
    try {
      await this.redisCache.del(key);
    } catch (error) {
      const err: ServerErrorType = {
        log: `Error inside deleteCacheById function, ${error}`,
        status: 400,
        message: {
          err: "Error in redis - deleteCacheById, Check server log for more details.",
        },
      };
      console.log(err);
    }
  }
