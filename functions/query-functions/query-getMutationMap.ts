/**
 *  Generates a map of mutation to GraphQL object types. This mapping is used
 *  to identify references to cached data when mutation occurs.
 *  @param {Object} schema - GraphQL defined schema that is used to facilitate caching by providing valid queries,
 *  mutations, and fields.
 *  @returns {Object} mutationMap - Map of mutations to GraphQL types.
 */
export function getMutationMap(schema: GraphQLSchema): MutationMapType {
	const mutationMap: MutationMapType = {};
	// get object containing all root mutations defined in the schema
	const mutationTypeFields: GraphQLSchema['_mutationType'] = schema?.getMutationType()?.getFields();
	// if queryTypeFields is a function, invoke it to get object with queries
	const mutationsObj: { [field: string]: FieldType } = typeof mutationTypeFields === 'function' ? mutationTypeFields() : mutationTypeFields;
	for (const mutation in mutationsObj) {
		// get name of GraphQL type returned by query
		// if ofType --> this is collection, else not collection

		let returnedType: ReturnType;
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
