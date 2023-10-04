/**
 *  Generates of map of fields to GraphQL types. This mapping is used to identify
 *  and create references to cached data.
 *  @param {Object} schema - GraphQL defined schema that is used to facilitate caching by providing valid queries,
 *  mutations, and fields.
 *  @returns {Object} fieldsMap - Map of fields to GraphQL types.
 */
function getFieldsMap(schema) {
	const fieldsMap = {};
	const typesList = schema.default ? schema.default._typeMap || {} : {};
	const builtInTypes = ['String', 'Int', 'Float', 'Boolean', 'ID', 'Query', '__Type', '__Field', '__EnumValue', '__DirectiveLocation', '__Schema', '__TypeKind', '__InputValue', '__Directive'];
	// exclude built-in types
	const customTypes = Object.keys(typesList).filter((type) => !builtInTypes.includes(type) && type !== schema.default?._queryType?.name);

	// loop through types
	for (const type of customTypes) {
		const fieldsObj = {};
		let fields = typesList[type]._fields;

		if (typeof fields === 'function') fields = fields();
		for (const field in fields) {
			const key = fields[field].name;
			const value = fields[field].type.ofType ? fields[field].type.ofType.name : fields[field].type.name;
			fieldsObj[key] = value;
		}
		// place assembled types on fieldsMap
		fieldsMap[type] = fieldsObj;
	}
	return fieldsMap;
}
