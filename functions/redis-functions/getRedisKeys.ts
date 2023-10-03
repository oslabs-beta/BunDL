/**
 * Gets the key names from the Redis cache and adds them to the response.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */

export const getRedisKeys = (req: Request, res: Response, next: NextFunction): void => {
	redisCache
		.keys('*')
		.then((response: string[]) => {
			res.locals.redisKeys = response;
			return next();
		})
		.catch((error: ServerErrorType) => {
			const err: ServerErrorType = {
				log: `Error inside catch block of getRedisKeys, keys potentially undefined, ${error}`,
				status: 400,
				message: {
					err: 'Error in redis - getRedisKeys. Check server log for more details.',
				},
			};
			return next(err);
		});
};
