/**
 * Traverses over a supplied query Object and uses the fields on there to create a query string reflecting the data.
 * This query string is a modified version of the query string received by Quell that has references to data found within the cache removed
 * so that the final query is faster and reduced in scope.
 * @param {Object} queryObject - A modified version of the prototype with only values we want to pass onto the queryString.
 * @param {string} operationType - A string indicating the GraphQL operation type- 'query', 'mutation', etc.
 */
export function createQueryStr(queryObject: QueryObject | ProtoObjType, operationType?: string): string {
	if (Object.keys(queryObject).length === 0) return '';
	const openCurly = '{';
	const closeCurly = '}';
	const openParen = '(';
	const closeParen = ')';

	let mainStr = '';

	// iterate over every key in queryObject
	// place key into query object
	for (const key in queryObject) {
		mainStr += ` ${key}${getAliasType(queryObject[key] as QueryFields)}${getArgs(queryObject[key] as QueryFields)} ${openCurly} ${stringify(queryObject[key] as QueryFields)}${closeCurly}`;
	}

	/**
	 * Helper function that is used to recursively build a GraphQL query string from a nested object,
	 * ignoring any __values (ie __alias and __args).
	 * @param {QueryFields} fields - An object whose properties need to be converted to a string to be used for a GraphQL query.
	 * @returns {string} innerStr - A graphQL query string.
	 */
	function stringify(fields: QueryFields): string {
		// initialize inner string
		let innerStr = '';
		// iterate over KEYS in OBJECT
		for (const key in fields) {
			// is fields[key] string? concat with inner string & empty space
			if (typeof fields[key] === 'boolean') {
				innerStr += key + ' ';
			}
			// is key object? && !key.includes('__'), recurse stringify
			if (typeof fields[key] === 'object' && !key.includes('__')) {
				const fieldsObj: QueryFields = fields[key] as QueryFields;
				// TODO try to fix this error
				const type: string = getAliasType(fieldsObj);
				const args: string = getArgs(fieldsObj);
				innerStr += `${key}${type}${args} ${openCurly} ${stringify(fieldsObj)}${closeCurly} `;
			}
		}

		return innerStr;
	}

	/**
	 * Helper function that iterates through arguments object for current field and creates
	 * an argument string to attach to the query string.
	 * @param {QueryFields} fields - Object whose arguments will be attached to the query string.
	 * @returns {string} Argument string to be attached to the query string.
	 */
	function getArgs(fields: QueryFields): string {
		let argString = '';
		if (!fields.__args) return '';

		Object.keys(fields.__args).forEach((key) => {
			argString ? (argString += `, ${key}: "${(fields.__args as QueryFields)[key]}"`) : (argString += `${key}: "${(fields.__args as QueryFields)[key]}"`);
		});

		// return arg string in parentheses, or if no arguments, return an empty string
		return argString ? `${openParen}${argString}${closeParen}` : '';
	}

	/**
	 * Helper function that formats the field's alias, if it exists, for the query string.
	 * @param {QueryFields} fields - Object whose alias will be attached to the query string.
	 * @returns {string} Alias string to be attached to the query string.
	 */
	function getAliasType(fields: QueryFields): string {
		return fields.__alias ? `: ${fields.__type}` : '';
	}

	// Create the final query string.
	const queryStr: string = openCurly + mainStr + ' ' + closeCurly;
	return operationType ? operationType + ' ' + queryStr : queryStr;
}
