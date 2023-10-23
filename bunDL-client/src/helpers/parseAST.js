const { parse, visit, BREAK } = require('graphql');
export function parseAST(AST, options = { userDefinedID: null }) {
  const proto = {};
  const frags = {};
  let operationType = '';
  const stack = [];
  const fieldArgs = {};
  const userDefinedID = options.userDefinedID;

  visit(AST, {
    enter(node) {
      if (node.directives && node.directives.length > 0) {
        operationType = 'unQuellable';
        return BREAK;
      }
    },

    OperationDefinition(node) {
      operationType = node.operation;
      if (operationType === 'subscription') {
        operationType = 'unQuellable';
        return BREAK;
      }
    },

    FragmentDefinition(node) {
      const fragName = node.name.value;
      stack.push(fragName);
      frags[fragName] = {};

      for (let i = 0; i < node.selectionSet.selections.length; i++) {
        if (node.selectionSet.selections[i].kind !== 'InlineFragment') {
          frags[fragName][node.selectionSet.selections[i].name.value] = true;
        }
      }
    },

    Field: {
      enter(node) {
        if (node.name.value.includes('__')) {
          operationType = 'unQuellable';
          return BREAK;
        }
        const argsObj = {};
        const auxObj = { __id: null };

        if (node.arguments) {
          node.arguments.forEach((arg) => {
            const key = arg.name.value;
            if (arg.value.kind === 'Variable' && operationType === 'query') {
              operationType = 'unQuellable';
              return BREAK;
            }
            if (
              arg.value.kind === 'NullValue' ||
              arg.value.kind === 'ObjectValue' ||
              arg.value.kind === 'ListValue'
            ) {
              operationType = 'unQuellable';
              return BREAK;
            }
            if (!key.includes('__')) {
              argsObj[key] = arg.value.value;
            }
            if (userDefinedID && key === userDefinedID) {
              auxObj.__id = arg.value.value;
            } else if (
              key === 'id' ||
              key === '_id' ||
              key === 'ID' ||
              key === 'Id'
            ) {
              auxObj.__id = arg.value.value;
            }
          });
        }

        const fieldType = node.alias ? node.alias.value : node.name.value;
        auxObj.__type = node.name.value.toLowerCase();
        auxObj.__alias = node.alias ? node.alias.value : null;
        auxObj.__args = Object.keys(argsObj).length > 0 ? argsObj : null;

        fieldArgs[fieldType] = { ...auxObj };
        stack.push(fieldType);
      },
      leave() {
        stack.pop();
      },
    },

    SelectionSet: {
      enter(node, key, parent, path, ancestors) {
        if (parent && !Array.isArray(parent) && parent.kind === 'Field') {
          const fieldsValues = {};
          let fragment = false;
          for (const field of node.selections) {
            if (field.kind === 'FragmentSpread') fragment = true;
            if (
              field.kind !== 'InlineFragment' &&
              (field.kind === 'FragmentSpread' || !field.selectionSet)
            )
              fieldsValues[field.name.value] = true;
          }
          if (
            !fieldsValues.hasOwnProperty('id') &&
            !fieldsValues.hasOwnProperty('_id') &&
            !fieldsValues.hasOwnProperty('ID') &&
            !fieldsValues.hasOwnProperty('Id') &&
            !fragment
          ) {
            operationType = 'noID';
            return BREAK;
          }

          const fieldsObject = {
            ...fieldsValues,
            ...fieldArgs[stack[stack.length - 1]],
          };

          stack.reduce((prev, curr, index) => {
            if (index + 1 === stack.length) prev[curr] = { ...fieldsObject };
            return prev[curr];
          }, proto);
        }
      },
      leave() {
        stack.pop();
      },
    },
  });

  return { proto, operationType, frags };
}
