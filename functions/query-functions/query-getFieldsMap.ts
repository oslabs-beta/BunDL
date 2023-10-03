/**
 *  Generates of map of fields to GraphQL types. This mapping is used to identify
 *  and create references to cached data.
 *  @param {Object} schema - GraphQL defined schema that is used to facilitate caching by providing valid queries,
 *  mutations, and fields.
 *  @returns {Object} fieldsMap - Map of fields to GraphQL types.
 */
export function getFieldsMap(schema: any): FieldsMapType {
	const fieldsMap: FieldsMapType = {};
	const typesList: GraphQLSchema['_typeMap'] = schema?.default?._typeMap || {};
	const builtInTypes: string[] = ['String', 'Int', 'Float', 'Boolean', 'ID', 'Query', '__Type', '__Field', '__EnumValue', '__DirectiveLocation', '__Schema', '__TypeKind', '__InputValue', '__Directive'];
	// exclude built-in types
	const customTypes = Object.keys(typesList).filter((type) => !builtInTypes.includes(type) && type !== schema.default?._queryType?.name);

	// loop through types
	for (const type of customTypes) {
		const fieldsObj: FieldsObjectType = {};
		// let fields: { [field: string]: FieldType }  = typesList[type]._fields;
		let fields = typesList[type]._fields;

		if (typeof fields === 'function') fields = fields();
		for (const field in fields) {
			const key: string = fields[field].name;
			const value: string = fields[field].type.ofType ? fields[field].type.ofType.name : fields[field].type.name;
			fieldsObj[key] = value;
		}
		// place assembled types on fieldsMap
		fieldsMap[type] = fieldsObj;
	}
	return fieldsMap;
}
