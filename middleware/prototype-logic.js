import { parse, visit, BREAK } from 'graphql';

function extractAST(AST) {
  console.log('this is extract ast func');
  let operationType = '';
  const path = [];
  const proto = {
    fields: {},
    frags: {},
    fragsDefinitions: {},
    operationType: '',
    fragmentType: '',
  };

  visit(AST, {
    OperationDefinition(node) {
      operationType = node.operation;
      proto.operation = operationType;

      if (node.selectionSet.selections[0].typeCondition) {
        proto.operationType =
          node.selectionSet.selections[0].typeCondition.name.value;
      } else {
        proto.operationType = node.selectionSet.selections[0].name.value;
      }

      if (operationType === 'subscription') {
        operationType = 'noBuns';
        return BREAK;
      }
    },
    Argument(node) {
      if (node.value.kind === 'Variable' && operationType === 'query') {
        operationType = 'noBuns';
        return BREAK;
      }

      function deepCheckArg(arg) {
        if (['NullValue', 'ObjectValue', 'ListValue'].includes(arg.kind)) {
          operationType = 'noBuns';
          return BREAK;
        }

        if (arg.kind === 'ObjectValue') {
          for (const field of arg.fields) {
            return deepCheckArg(field.value);
          }
        }
      }

      return deepCheckArg(node.value);
    },
    Directive() {
      operationType = 'noBuns';
      return BREAK;
    },
    Field: {
      enter(node) {
        const fieldName = node.alias ? node.name.value : node.name.value;
        path.push(fieldName);

        function setNestedProperty(obj, pathArray, value) {
          let current = obj;
          for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) current[pathArray[i]] = {};
            current = current[pathArray[i]];
          }
          current[pathArray[pathArray.length - 1]] = value;
        }

        // Metadata collection
        const fieldMetadata = {
          name: node.name.value,
          args: node.arguments
            ? node.arguments.map((arg) => ({
                name: arg.name.value,
                value: arg.value.value,
              }))
            : [],
          alias: node.alias ? node.alias.value : null,
          type: null,
        };

        const isID = ['id', '_id', 'ID', 'Id'].includes(node.name.value);
        setNestedProperty(proto.fields, path, isID);
      },
      leave() {
        path.pop();
      },
    },
    FragmentDefinition(node) {
      proto.fragsDefinitions[node.name.value] = {};
      for (const field of node.selectionSet.selections) {
        if (field.kind !== 'InlineFragment') {
          proto.fragsDefinitions[node.name.value][field.name.value] = true;
        }
      }
    },

    FragmentSpread(node) {
      if (proto.fragsDefinitions[node.name.value]) {
        const fragmentFields = proto.fragsDefinitions[node.name.value];
        for (let fieldName in fragmentFields) {
          setNestedProperty(proto.fields, path.concat([fieldName]), true);
        }
      }
      if (proto.fragsDefinitions[node.name.value]) {
        const fragmentFields = proto.fragsDefinitions[node.name.value];
        for (let fieldName in fragmentFields) {
          setNestedProperty(proto.fields, path.concat([fieldName]), true);
        }
      }
    },
    SelectionSet: {
      enter(node, key, parent) {
        if (parent.kind === 'InlineFragment') {
          proto.fragmentType = parent.typeCondition.name.value;
        }
      },
      leave() {
        path.pop();
      },
    },
  });

  if (
    !proto.fields.id &&
    !proto.fields._id &&
    !proto.fields.ID &&
    !proto.fields.Id
  ) {
    operationType = 'noID';
  }

  const obj = { proto, operationType };
  return obj;
}

export default extractAST;
