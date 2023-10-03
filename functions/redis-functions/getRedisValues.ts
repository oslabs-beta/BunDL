/**
 * Gets the values associated with the Redis cache keys and adds them to the response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getRedisValues = (req: Request, res: Response, next: NextFunction): void => {
	if (res.locals.redisKeys && res.locals.redisKeys.length !== 0) {
		redisCache
			.mGet(res.locals.redisKeys)
			.then((response: (string | null)[]) => {
				res.locals.redisValues = response;
				return next();
			})
			.catch((error: ServerErrorType) => {
				const err: ServerErrorType = {
					log: `Error inside catch block of getRedisValues, ${error}`,
					status: 400,
					message: {
						err: 'Error in redis - getRedisValues. Check server log for more details.',
					},
				};
				return next(err);
			});
	} else {
		res.locals.redisValues = [];
		return next();
	}
};
