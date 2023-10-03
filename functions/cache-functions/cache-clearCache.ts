  /**
   * Flushes the Redis cache. To clear the cache from the client, establish an endpoint that
   * passes the request and response objects to an instance of QuellCache.clearCache.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  clearCache(req: Request, res: Response, next: NextFunction) {
    console.log("Clearing Redis Cache");
    this.redisCache.flushAll();
    idCache = {};
    return next();
  }