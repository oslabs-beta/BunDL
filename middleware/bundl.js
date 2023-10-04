export class BunDL {
  constructor(
    schema,
    cacheExpiration = 1209600, // Default expiry time is 14 days
    costParameters = defaultCostParams,
    redisPort,
    redisHost,
    redisPassword
  ) {}

  async query(req, res, next) {}
}
