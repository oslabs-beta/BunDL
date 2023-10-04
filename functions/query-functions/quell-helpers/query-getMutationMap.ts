/**
 *  Generates a map of mutation to GraphQL object types. This mapping is used
 *  to identify references to cached data when mutation occurs.
 *  @param {Object} schema - GraphQL defined schema that is used to facilitate caching by providing valid queries,
 *  mutations, and fields.
 *  @returns {Object} mutationMap - Map of mutations to GraphQL types.
 */
function getMutationMap(schema) {
	const mutationMap = {};
	// get object containing all root mutations defined in the schema
	const mutationTypeFields = schema ? schema.getMutationType().getFields() : null;
	// if queryTypeFields is a function, invoke it to get an object with queries
	const mutationsObj = typeof mutationTypeFields === 'function' ? mutationTypeFields() : mutationTypeFields;
	for (const mutation in mutationsObj) {
		// get the name of the GraphQL type returned by the mutation
		// if ofType --> this is a collection, else not a collection
		let returnedType;
		if (mutationsObj[mutation].type.ofType) {
			returnedType = [];
			returnedType.push(mutationsObj[mutation].type.ofType.name);
		}
		if (mutationsObj[mutation].type.name) {
			returnedType = mutationsObj[mutation].type.name;
		}
		mutationMap[mutation] = returnedType;
	}
	return mutationMap;
}
