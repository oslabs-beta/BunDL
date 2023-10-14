import { visit, BREAK } from 'graphql';

function extractAST(AST, variableValues = {}) {
  // console.log('this is extract ast func');
  let operationType = '';
  const path = [];
  const proto = {
    fields: {},
    frags: {},
    fragsDefinitions: {},
    primaryQueryType: '',
    fragmentType: '',
    variableValues: {},
  };

  function setNestedProperty(obj, pathArray, value) {
    let current = obj;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) current[pathArray[i]] = {};
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;
  }

  visit(AST, {
    OperationDefinition(node) {
      operationType = node.operation;
      proto.operation = operationType;

      if (node.selectionSet.selections[0].typeCondition) {
        proto.primaryQueryType =
          node.selectionSet.selections[0].typeCondition.name.value;
      } else {
        proto.primaryQueryType = node.selectionSet.selections[0].name.value;
      }

      if (operationType === 'subscription') {
        operationType = 'noBuns';
        return BREAK;
      }
    },
    Variable(node) {
      proto.variableValues[node.name.value] = variableValues[node.name.value];
    },
    Argument(node) {
      function deepCheckArg(arg) {
        if (arg.kind === 'ObjectValue') {
          const obj = {};
          for (const field of arg.fields) {
            obj[field.name.value] = deepCheckArg(field.value);
          }
          return obj;
        } else if (arg.kind === 'ListValue') {
          return arg.values.map(deepCheckArg);
        } else if (arg.kind === 'Variable') {
          // Return variable value if available
          return proto.variableValues[arg.name.value];
        } else {
          return arg.value;
        }
      }

      const argValue = deepCheckArg(node.value);
      setNestedProperty(
        proto.fields,
        [...path, '$' + node.name.value],
        argValue
      );
    },
    //conditionals within queries (skip this field, or include this field)
    // @ symbol = directives in the discord example ken pasted: FetchUserData 
    Directive(node) {
      if (node.name.value === 'skip' || node.name.value === 'include') {
        setNestedProperty(
          proto.fields,
          [...path, '@' + node.name.value],
          node.arguments.map((arg) => arg.value.value)
        );
      } else {
        operationType = 'noBuns';
      }
    },
    Field: {
      enter(node) {
        const fieldName = node.alias ? node.alias.value : node.name.value;
        path.push(fieldName);

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
    // fragments: a shorthand to bundl(e) 
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
