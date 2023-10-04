/**
 *  Generates a map of queries to GraphQL object types. This mapping is used
 *  to identify and create references to cached data.
 *  @param {Object} schema - GraphQL defined schema that is used to facilitate caching by providing valid queries,
 *  mutations, and fields.
 *  @returns {Object} queryMap - Map of queries to GraphQL types.
 */
export function getQueryMap(schema: GraphQLSchema): QueryMapType {
	const queryMap: QueryMapType = {};
	// get object containing all root queries defined in the schema
	const queryTypeFields: GraphQLSchema['_queryType'] = schema?.getQueryType()?.getFields();
	// if queryTypeFields is a function, invoke it to get object with queries
	const queriesObj: { [field: string]: FieldType } = typeof queryTypeFields === 'function' ? queryTypeFields() : queryTypeFields;
	for (const query in queriesObj) {
		// get name of GraphQL type returned by query
		// if ofType --> this is collection, else not collection
		let returnedType: ReturnType;
		if (queriesObj[query].type.ofType) {
			returnedType = [];
			returnedType.push(queriesObj[query].type.ofType.name);
		}
		if (queriesObj[query].type.name) {
			returnedType = queriesObj[query].type.name;
		}
		queryMap[query] = returnedType;
	}
	return queryMap;
}
