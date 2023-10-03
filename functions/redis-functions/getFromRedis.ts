/**
 * Reads from Redis cache and returns a promise (Redis v4 natively returns a promise).
 * @param {string} key - The key for Redis lookup.
 * @returns {Promise} A promise representing the value from the redis cache with the provided key.
 */
export const getFromRedis = async (key: String, redisCache: RedisClientType): Promise<string | null | void> => {
	try {
		if (typeof key !== 'string' || key === undefined) return;
		const lowerKey: string = key.toLowerCase();
		const redisResult: string | null = await redisCache.get(lowerKey);
		return redisResult;
	} catch (error) {
		const err: ServerErrorType = {
			log: `Error in QuellCache trying to getFromRedis, ${error}`,
			status: 400,
			message: {
				err: 'Error in getFromRedis. Check server log for more details.',
			},
		};
		console.log('err in getFromRedis: ', err);
	}
};
