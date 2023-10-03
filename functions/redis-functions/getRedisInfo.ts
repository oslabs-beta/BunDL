/**
 * Returns a chain of middleware based on what information (if any) the user would
 * like to request from the specified redisCache. It requires an appropriately
 * configured Express route and saves the specified stats to res.locals, for instance:
 * @example
 *  app.use('/redis', getRedisInfo({
 *    getStats: true,
 *    getKeys: true,
 *    getValues: true
 *  }));
 * @param {Object} options - Three properties with boolean values: getStats, getKeys, getValues
 * @returns {Array} An array of middleware functions that retrieves specified Redis info.
 */

export const getRedisInfo = (
	options: RedisOptionsType = {
		getStats: true,
		getKeys: true,
		getValues: true,
	}
): RequestHandler[] => {
	console.log('Getting Redis Info');
	const middleware: RequestHandler[] = [];

	/**
	 * Helper function within the getRedisInfo function that returns
	 * what redis data should be retrieved based on the passed in options.
	 * @param {Object} opts - Options object containing a boolean value for getStats, getKeys, and getValues.
	 * @returns {string} String that indicates which data should be retrieved from Redis instance.
	 */
	const getOptions = (opts: RedisOptionsType): string => {
		const { getStats, getKeys, getValues } = opts;
		if (!getStats && getKeys && getValues) return 'dontGetStats';
		else if (getStats && getKeys && !getValues) return 'dontGetValues';
		else if (!getStats && getKeys && !getValues) return 'getKeysOnly';
		else if (getStats && !getKeys && !getValues) return 'getStatsOnly';
		else return 'getAll';
	};

	switch (getOptions(options)) {
		case 'dontGetStats':
			middleware.push(getRedisKeys, getRedisValues);
			break;
		case 'dontGetValues':
			middleware.push(getStatsFromRedis, getRedisKeys);
			break;
		case 'getKeysOnly':
			middleware.push(getRedisKeys);
			break;
		case 'getStatsOnly':
			middleware.push(getStatsFromRedis);
			break;
		case 'getAll':
			middleware.push(getStatsFromRedis, getRedisKeys, getRedisValues);
			break;
	}
	return middleware;
};
