/**
 * Takes in a map of fields and true/false values (the prototype) and creates a query object containing any values missing from the cache.
 * The resulting queryObj is then used as a template to create GraphQL query strings.
 * @param {ProtoObjType} map - Map of fields and true/false values from initial request, should be the prototype.
 * @returns {Object} queryObject that includes only the values to be requested from GraphQL endpoint.
 */
export function createQueryObj(map: ProtoObjType): ProtoObjType {
	const output: ProtoObjType = {};
	// iterate over every key in map
	// true values are filtered out, false values are placed on output
	for (const key in map) {
		const reduced: ProtoObjType = reducer(map[key] as ProtoObjType);
		if (Object.keys(reduced).length > 0) {
			output[key] = reduced;
		}
	}

	/**
	 * Takes in a fields object and returns only the values needed from the server.
	 * @param {Object} fields - Object containing true or false values that determines what should be
	 * retrieved from the server.
	 * @returns {Object} Filtered object of only queries without a value or an empty object.
	 */
	function reducer(fields: ProtoObjType): ProtoObjType {
		// Create a filter object to store values needed from server.
		const filter: ProtoObjType = {};
		// Create a propsFilter object for properties such as args, aliases, etc.
		const propsFilter: ProtoObjType = {};

		for (const key in fields) {
			// If value is false, place directly on filter
			if (fields[key] === false) {
				filter[key] = false;
			}
			// Force the id onto the query object
			if (key === 'id' || key === '_id' || key === 'ID' || key === 'Id') {
				filter[key] = false;
			}

			// If value is an object, recurse to determine nested values
			if (typeof fields[key] === 'object' && !key.includes('__')) {
				const reduced: ProtoObjType = reducer(fields[key] as ProtoObjType);
				// if reduced object has any values to pass, place on filter
				if (Object.keys(reduced).length > 1) {
					filter[key] = reduced;
				}
			}

			// If reserved property such as args or alias, place on propsFilter
			if (key.includes('__')) {
				propsFilter[key] = fields[key];
			}
		}

		const numFields: number = Object.keys(fields).length;

		// If the filter has any values to pass, return filter & propsFilter; otherwise return empty object
		return Object.keys(filter).length > 1 && numFields > 5 ? { ...filter, ...propsFilter } : {};
	}
	return output;
}
