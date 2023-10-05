/**
This function, `parseAST`, is responsible for traversing an abstract syntax tree (AST) generated from a GraphQL query and extracting relevant information to create a template for various operations related to GraphQL query processing. Let's break down the key components and functionality of this function:

**Parameters**:
- `AST` (Object): The abstract syntax tree generated by a GraphQL library. It represents the structure of the GraphQL query.
- `options` (Object, optional): An object for user-supplied options. In this function, it's primarily used to extract a user-defined ID, but its integration is not fully implemented.

**Returns**:
- `proto` (Object): This is the prototype object that will serve as a template for various operations related to caching, building modified queries, and more.
- `operationType` (string): It represents the type of GraphQL operation, which can be 'query', 'mutation', 'subscription', 'noID', or 'unQuellable'.
- `frags` (Object): This object contains information about the fragments defined in the query. It's structured similarly to `proto`.

**Functionality**:
1. Initialization: The function initializes various data structures, including `proto` (the prototype object), `frags` (for fragments), `operationType` (for the GraphQL operation type), `stack` (a stack to keep track of the depth-first parsing path), `fieldArgs` (to store field arguments), and `userDefinedID` (extracted from the `options` parameter).

2. Depth-First Traversal: The function uses the `visit` utility provided by the `graphql-JS` library to perform a depth-first traversal of the AST. During traversal, it invokes specific callback functions for different types of nodes encountered in the AST.

3. Callbacks for Node Types:
   - `enter` callback for various node types: This function is called when entering different types of nodes in the AST. For example, it checks if a node has directives and marks the operation as 'unQuellable' if directives are present. It also identifies the operation type by examining the `OperationDefinition` node.

   - `OperationDefinition` callback: This function specifically handles the `OperationDefinition` node, determining whether it's a 'subscription' operation and marking it as 'unQuellable' if it is.

   - `FragmentDefinition` callback: This function handles `FragmentDefinition` nodes, extracting the fragment name, adding it to the `stack`, and initializing an entry in the `frags` object for the fragment.

   - `Field` callback: This function is called when entering a `Field` node, which represents a field in the query. It handles various aspects of the field, including arguments, aliases, and field-specific options. It also tracks the field type, adds arguments to `argsObj`, and determines the `__id` field.

4. `SelectionSet` Handling: The function also handles `SelectionSet` nodes, which represent sub-fields within a field. It constructs a `fieldsObject` to collect fields as it loops through the selections. It checks if the field includes a fragment spread and includes fields not contained within a nested object.

5. Caching and Templates: The function constructs a `proto` object by combining information from various parts of the traversal. It uses the `stack` to determine the path within `proto` where fields should be added. The function also checks if the query lacks an 'id' field and marks it as 'noID' if necessary.

6. Returning Results: Finally, the function returns the `proto` object, the `operationType`, and the `frags` object as the result.

In summary, this function is crucial for analyzing GraphQL queries, extracting relevant information, and creating a template (`proto`) that can be used for various operations in GraphQL query processing, including caching and query modification. It also identifies the type of operation and tracks fragments defined in the query.
 */




/**
 * Traverses the abstract syntax tree depth-first to create a template for future operations, such as
 * request data from the cache, creating a modified query string for additional information needed, and joining cache and database responses.
 * @param {Object} AST - An abstract syntax tree generated by GraphQL library that we will traverse to build our prototype.
 * @param {Object} options - (not fully integrated) A field for user-supplied options.
 * @returns {Object} prototype object
 * @returns {string} operationType
 * @returns {Object} frags object
 */
export function parseAST(AST, options = { userDefinedID: null }) {
	// Initialize prototype and frags as empty objects.
	// Information from the AST is distilled into the prototype for easy
	// access during caching, rebuilding query strings, etc.
	const proto = {};

	// The frags object will contain the fragments defined in the query in a format
	// similar to the proto.
	const frags = {};

	// Create operation type variable. This will be 'query', 'mutation', 'subscription', 'noID', or 'unQuellable'.
	let operationType = '';

	// Initialize a stack to keep track of depth first parsing path.
	const stack = [];

	// Create field arguments object, which will track the id, type, alias, and args for the fields.
	// The field arguments object will eventually be merged with the prototype object.
	const fieldArgs = {};

	// Extract the userDefinedID from the options object, if provided.
	const userDefinedID = options.userDefinedID;

	/**
	 * visit is a utility provided in the graphql-JS library. It performs a
	 * depth-first traversal of the abstract syntax tree, invoking a callback
	 * when each SelectionSet node is entered. That function builds the prototype.
	 * Invokes a callback when entering and leaving Field node to keep track of nodes with stack
	 *
	 * Find documentation at:
	 * https://graphql.org/graphql-js/language/#visit
	 */
	visit(AST, {
		// The enter function will be triggered upon entering each node in the traversal.
		enter(node) {
			// Quell cannot cache directives, so we need to return as unQuellable if the node has directives.
			if (node.directives && node.directives.length > 0) {
				operationType = 'unQuellable';
				// Return BREAK to break out of the current traversal branch.
				return BREAK;
			}
		},

		// If the current node is of type OperationDefinition, this function will be triggered upon entering it.
		// It checks the type of operation being performed.
		OperationDefinition(node) {
			// Quell cannot cache subscriptions, so we need to return as unQuellable if the type is subscription.
			operationType = node.operation;
			if (operationType === 'subscription') {
				operationType = 'unQuellable';
				// Return BREAK to break out of the current traversal branch.
				return BREAK;
			}
		},

		// If the current node is of type FragmentDefinition, this function will be triggered upon entering it.
		FragmentDefinition(node) {
			// Get the name of the fragment.
			const fragName = node.name.value;

			// Add the fragment name to the stack.
			stack.push(fragName);

			// Add the fragment name as a key in the frags object, initialized to an empty object.
			frags[fragName] = {};

			// Loop through the selections in the selection set for the current FragmentDefinition node
			// in order to extract the fields in the fragment.
			for (let i = 0; i < node.selectionSet.selections.length; i++) {
				// Below, we get the 'name' property from the SelectionNode.
				// However, InlineFragmentNode (one of the possible types for SelectionNode) does
				// not have a 'name' property, so we will want to skip nodes with that type.
				if (node.selectionSet.selections[i].kind !== 'InlineFragment') {
					// Add base-level field names in the fragment to the frags object.
					frags[fragName][(node.selectionSet.selections[i].name.value] = true;
				}
			}
		},

		Field: {
			// If the current node is of type Field, this function will be triggered upon entering it.
			enter(node) {
				// Return introspection queries as unQuellable so that we do not cache them.
				// "__keyname" syntax is later used for Quell's field-specific options, though this does not create collision with introspection.
				if (node.name.value.includes('__')) {
					operationType = 'unQuellable';
					// Return BREAK to break out of the current traversal branch.
					return BREAK;
				}

				// Create an args object that will be populated with the current node's arguments.
				const argsObj = {};

				// Auxiliary object for storing arguments, aliases, field-specific options, and more.
				// Query-wide options should be handled on Quell's options object.
				const auxObj = {
					__id: null,
				};

				// Loop through the field's arguments.
				if (node.arguments) {
					node.arguments.forEach((arg) => {
						const key = arg.name.value;

						// Quell cannot cache queries with variables, so we need to return unQuellable if the query has variables.
						if (arg.value.kind === 'Variable' && operationType === 'query') {
							operationType = 'unQuellable';
							// Return BREAK to break out of the current traversal branch.
							return BREAK;
						}

						/*
						 * In the next step, we get the value from the argument node's value node.
						 * This assumes that the value node has a 'value' property.
						 * If the 'kind' of the value node is ObjectValue, ListValue, NullValue, or ListValue
						 * then the value node will not have a 'value' property, so we must first check that
						 * the 'kind' does not match any of those types.
						 */
						if (arg.value.kind === 'NullValue' || arg.value.kind === 'ObjectValue' || arg.value.kind === 'ListValue') {
							operationType = 'unQuellable';
							// Return BREAK to break out of the current traversal branch.
							return BREAK;
						}

						// Assign argument values to argsObj (key will be argument name, value will be argument value),
						// skipping field-specific options ('__') provided as arguments.
						if (!key.includes('__')) {
							// Get the value from the argument node's value node.
							argsObj[key] = arg.value.value;
						}

						// If a userDefinedID was included in the options object and the current argument name matches
						// that ID, update the auxiliary object's id.
						if (userDefinedID ? key === userDefinedID : false) {
							auxObj.__id = arg.value.value;
						} else if (
							// If a userDefinedID was not provided, determine the uniqueID from the args.
							// Note: do not use key.includes('id') to avoid assigning fields such as "idea" or "idiom" as uniqueID.
							key === 'id' ||
							key === '_id' ||
							key === 'ID' ||
							key === 'Id'
						) {
							// If the name of the argument is 'id', '_id', 'ID', or 'Id',
							// set the '__id' field on the auxObj equal to value of that argument.
							auxObj.__id = (arg.value).value;
						}
					});
				}

				// Gather other auxiliary data such as aliases, arguments, query type, and more to append to the prototype for future reference.

				// Set the fieldType (which will be the key in the fieldArgs object) equal to either the field's alias or the field's name.
				const fieldType = node.alias ? node.alias.value : node.name.value;

				// Set the '__type' property of the auxiliary object equal to the field's name, converted to lower case.
				auxObj.__type = node.name.value.toLowerCase();

				// Set the '__alias' property of the auxiliary object equal to the field's alias if it has one.
				auxObj.__alias = node.alias ? node.alias.value : null;

				// Set the '__args' property of the auxiliary object equal to the args
				auxObj.__args = Object.keys(argsObj).length > 0 ? argsObj : null;

				// Add auxObj fields to prototype, allowing future access to type, alias, args, etc.
				fieldArgs[fieldType] = {
					...auxObj,
				};
				// Add the field type to stacks to keep track of depth-first parsing path.
				stack.push(fieldType);
			},

			// If the current node is of type Field, this function will be triggered after visiting it and all of its children.
			leave() {
				// Pop stacks to keep track of depth-first parsing path.
				stack.pop();
			},
		},

		SelectionSet: {
			// If the current node is of type SelectionSet, this function will be triggered upon entering it.
			// The selection sets contain all of the sub-fields.
			// Iterate through the sub-fields to construct fieldsObject
			enter(
				node,
				key,
				parent) {
				/*
				 * Exclude SelectionSet nodes whose parents are not of the kind
				 * 'Field' to exclude nodes that do not contain information about
				 *  queried fields.
				 */
				// FIXME: It is possible for the parent to be an array. This happens when the selection set
				// is a fragment spread. In that case, the parent will not have a 'kind' property. For now,
				// add a check that parent is not an array.
				if (
					parent && // parent is not undefined
					!Array.isArray(parent) && // parent is not readonly ASTNode[]
					(parent).kind === 'Field' // can now safely cast parent to ASTNode
				) {
					// Create fieldsValues object that will be used to collect fields as
					// we loop through the selections.
					const fieldsValues = {};

					/*
					 * Create a variable called fragment, initialized to false, to indicate whether the selection set includes a fragment spread.
					 * Loop through the current selection set's selections array.
					 * If the array contains a FragmentSpread node, set the fragment variable to true.
					 * This is reset to false upon entering each new selection set.
					 */
					let fragment = false;
					for (const field of node.selections) {
						if (field.kind === 'FragmentSpread') fragment = true;
						/*
						 * If the current selection in the selections array is not a nested object
						 * (i.e. does not have a SelectionSet), set its value in fieldsValues to true.
						 * Below, we get the 'name' property from the SelectionNode.
						 * However, InlineFragmentNode (one of the possible types for SelectionNode) does
						 * not have a 'name' property, so we will want to skip nodes with that type.
						 * Furthermore, FragmentSpreadNodes never have a selection set property.
						 */
						if (field.kind !== 'InlineFragment' && (field.kind === 'FragmentSpread' || !field.selectionSet)) fieldsValues[field.name.value] = true;
					}
					// If ID was not included on the request and the current node is not a fragment, then the query
					// will not be included in the cache, but the request will be processed.
					if (!Object.prototype.hasOwnProperty.call(fieldsValues, 'id') && !Object.prototype.hasOwnProperty.call(fieldsValues, '_id') && !Object.prototype.hasOwnProperty.call(fieldsValues, 'ID') && !Object.prototype.hasOwnProperty.call(fieldsValues, 'Id') && !fragment) {
						operationType = 'noID';
						// Return BREAK to break out of the current traversal branch.
						return BREAK;
					}

					// Place current fieldArgs object onto fieldsObject so it gets passed along to prototype.
					// The fieldArgs contains arguments, aliases, etc.
					const fieldsObject = {
						...fieldsValues,
						...fieldArgs[stack[stack.length - 1]],
					};
					// Loop through stack to get correct path in proto for temp object
					stack.reduce((prev, curr, index) => {
						// if last item in path, set value
						if (index + 1 === stack.length) prev[curr] = { ...fieldsObject };
						return prev[curr];
					}, proto);
				}
			},

			// If the current node is of type SelectionSet, this function will be triggered upon entering it.
			leave() {
				// Pop stacks to keep track of depth-first parsing path
				stack.pop();
			},
		},
	});
	return { proto, operationType, frags };
}