import { visit, BREAK } from 'graphql';

function extractAST(AST, config, variables = {}) {
  let operationType = '';
  const setPath = [];
  const proto = {
    fields: {},
  };
  let fragsDefinitions = {};
  let primaryQueryType = '';
  let fragmentType = '';
  let variableValues = {};

  function setNestedProperty(obj, pathArray, value) {
    let current = obj;
    for (let i = 0; i < pathArray.length; i++) {
      const key = pathArray[i];
      if (typeof current[key] === 'boolean' || !current[key]) {
        // If the key doesn't exist or it's a primitive, set it to an empty object
        current[key] = {};
      }
      // If it's the last key in the path, set the value
      if (i === pathArray.length - 1) {
        if (typeof value === 'boolean') current[key] = value;
        else if (typeof value === 'object') current[key].subdata = value;
        else current[key] = value;
      } else {
        // Otherwise, traverse deeper
        current = current[key];
      }
    }
  }

  visit(AST, {
    FragmentDefinition(node) {
      console.log(node.name.value);
      const fragName = node.name.value;
      fragsDefinitions[fragName] = {};
      for (const selections of node.selectionSet.selections) {
        if (selections.kind !== 'InlineFragment') {
          fragsDefinitions[fragName][selections.name.value] = true;
        }
      }
    },
  });

  let hasArguments = false;
  visit(AST, {
    Argument() {
      hasArguments = true;
      return BREAK;
    },
  });

  if (!hasArguments && config.requireArguments) {
    console.log('no arguments');
    // return { proto: null, operationType: 'noArguments' };
    return { proto: null, operationType: 'noBuns' };
  }

  visit(AST, {
    enter(node) {
      //conditionals within queries (skip this field, or include this field)
      // @ symbol = directives in the discord example ken pasted: FetchUserData
      if (node.directives && node.directives.length > 0) {
        operationType = 'noBuns';
        return BREAK;
      }
    },
    OperationDefinition(node) {
      operationType = node.operation;
      // operation = operationType;

      if (node.selectionSet.selections[0].typeCondition) {
        primaryQueryType =
          node.selectionSet.selections[0].typeCondition.name.value;
      } else {
        primaryQueryType = node.selectionSet.selections[0].name.value;
      }

      if (operationType === 'subscription') {
        operationType = 'noBuns';
        return BREAK;
      }
    },

    Variable(node, key, parent, path, ancestors) {
      if (!config.cacheVariables) {
        operationType = 'noBuns';
        return BREAK;
      }

      let fieldName;
      if (ancestors[ancestors.length - 2].kind === 'Field') {
        fieldName = ancestors[ancestors.length - 2].name.value;
      }
      if (variables && fieldName) {
        for (let [key, value] of Object.entries(variables)) {
          variableValues[fieldName] = variableValues[fieldName] || {};
          variableValues[fieldName][key] = value;
          console.log(
            'Variable saved as: ',
            (variableValues[fieldName][key] = value)
          );
        }
      }
    },

    Argument(node, key, parent, path, ancestors) {
      function deepCheckArg(arg) {
        if (
          arg.kind === 'ObjectValue' ||
          arg.kind === 'NullValue' ||
          arg.kind === 'ListValue'
        ) {
          operationType = 'noBuns';
          return BREAK;
        } else if (arg.kind === 'Variable' && config.cacheVariables) {
          return arg.name.value;
        } else {
          if (ancestors[ancestors.length - 1].kind === 'Field') {
            const fieldName = ancestors[ancestors.length - 1].name.value;
            variableValues[fieldName] = variableValues[fieldName] || {};
            variableValues[fieldName][node.name.value] = arg.value;
          }
          return arg.value;
        }
      }
      deepCheckArg(node.value);
    },

    Field: {
      enter(node, key, parent) {
        if (node.name.value.includes('__')) {
          operationType = 'noBuns';
          return BREAK;
        }
        if (node.directives && node.directives.length) {
          operationType = 'noBuns';
          return BREAK;
        }
        // Use the original field name as the key in proto structure
        const fieldSubdata = {
          // The actual field name as specified in the GraphQL query (e.g., "name" not "firstName")
          name: node.name.value,
          args: node.arguments
            ? // An array of arguments if they exist, otherwise an empty array.
              node.arguments.map((arg) => ({
                // The name of the argument.
                name: arg.name.value,
                // The value of the argument.
                value: arg.value.value,
              }))
            : null,
          // The alias of the field if it exists, otherwise null.
          alias: node.alias ? node.alias.value : null,
          // Currently always set to null. Acting as a placeholder for now
          type: null,
        };

        // Push to path based on alias if it exists or field name if it doesn't.
        const pathName = node.alias ? node.alias.value : node.name.value;
        setPath.push(pathName);

        if (config.cacheMetadata) {
          setNestedProperty(proto.fields, setPath, fieldSubdata);
        } else {
          setNestedProperty(proto.fields, setPath, true);
        }

        if (node.selectionSet) {
          for (const selection of node.selectionSet.selections) {
            if (selection.kind === 'FragmentSpread') {
              const fragmentFields = fragsDefinitions[selection.name.value];
              for (let fieldName in fragmentFields) {
                setNestedProperty(
                  proto.fields,
                  setPath.concat([fieldName]),
                  true
                );
              }
            }
          }
        }
      },
      leave() {
        setPath.pop();
      },
    },

    SelectionSet: {
      enter(node, key, parent) {
        if (parent && !Array.isArray(parent) && parent.kind === 'Field') {
          const fieldsValues = {};
          let fragment = false;

          for (const field of node.selections) {
            if (field.kind === 'FragmentSpread') fragment = true;
            if (
              field.kind !== 'InlineFragment' &&
              (field.kind === 'FragmentSpread' || !field.selectionSet)
            ) {
              fieldsValues[field.name.value] = true;
            }
          }
        }
      },
      leave() {
        setPath.pop();
      },
    },
  });
  return {
    proto,
    operationType,
    fragsDefinitions,
    primaryQueryType,
    fragmentType,
    variableValues,
  };
}

export default extractAST;
