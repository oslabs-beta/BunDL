// async query(req, res, next) {

//   const {proto, operationType, frags} = res.locals.parsed AST ? res.locals.parsed AST : extractAST(AST)

//   const prototype = proto

//   const cacheKey = JSON.stringify(prototype);

//   const cachedData = cache[cacheKey];
//   if(cachedData){
//     res.locals.data = cachedData;
//     return next();
//   }
// }

function extractAST(AST) {
  let operationType = '';
  const path = [];
  const proto = {
    fields: {},
    frags: {},
    operation: '',
    type: null,
  };

  const fragsDefinition = {};

  visit(AST, {
    OperationDefinition(node) {
      operationType = node.operation;
      proto.operation = operationType;

      if (node.selectionSet.selections[0].typeCondition) {
        proto.type = node.selectionSet.selections[0].typeCondition.name.value;
      } else {
        proto.type = node.selectionSet.selections[0].name.value;
      }

      if (operationType === 'subscription') {
        operationType = 'noBuns';
        BREAK; // halt traversal
      }
    },

    FragmentsDefinition(node){
      fragsDefinitions[node.name.value] = node.selectionSet.selections.reduce(())
    },

    Argument(node) {
      if (node.value.kind === 'Variable' && operationType === 'query') {
        operationType = 'noBuns';
        BREAK; // halt traversal
      }
      function deepCheckArg(arg) {
        if (
          ['NullValue', 'ObjectValue', 'ListValue'].includes(node.value.kind)
        ) {
          operationType = 'noBuns';
          BREAK;
        }
        if (arg.kind === 'ObjectValue') {
          for (const field of arg.fields) {
            return deepCheckArg(field.value);
          }
        }
      }
      return deepCheckArg(node.value);
    },
    Directive(node) {
      operationType = 'noBuns';
      BREAK;
    },
    Field: {
      enter(node) {
        const fieldName = node.alias ? node.alias.value : node.name.value;

        if (['id', '_id', 'ID', 'Id'].includes(node.name.value)) {
          proto.fields[fieldName].id = true;
        }

        if (node.name.value.includes('__')) {
          operationType = 'noBuns';
          BREAK; // halt traversal
        }

        proto.fields[fieldName] = true;

        // Navigate to the current level in the proto based on the path.
        let currentLevel = proto.fields;
        for (const level of path) {
          currentLevel = currentLevel[level];
        }
        const fieldObj = {
          arguments: {},
          type: node.type
            ? node.type.name
              ? node.type.name.value
              : node.type.type.name.value
            : null,
        };
        node.arguments.forEach((arg) => {
          fieldObj.arguments[arg.name.value] = arg.value.value;
        });

        // Initialize a new object for the field in the proto.
        currentLevel[fieldName] = fieldObj;
        path.push(fieldName); // Push current field to path.
      },
      leave() {
        path.pop(); // Pop the current field from path.
      },
    },

    SelectionSet: {
      enter(node, key, parent) {},
    },
  });

  return { proto, operationType };
}

async query {

  prototype = await extractAST(AST)

  if (operationType === 'noBuns') {
    graphql(this.schema, sanitizedQuery)
      .then((queryResults) => {
        res.locals.queryResults = queryResults;
        return next();
      })
      .catch((error) => {
        const err = {
          log: 'rip',
          status: 400,
          message: {
            err: 'GraphQL query Error',
          },
        };
        return next(err);
      });
  } else {
    graphql(this.schema, sanitizedQuery)
      .then((queryResults) => {
        res.locals.queryResults = queryResults;
        this.writeToCache(sanitizedQuery, queryResults);
        return next();
      })
      .catch((error) => {
        const err = {
          log: 'rip again',
          status: 400,
          message: {
            err: 'GraphQL query Error',
          },
        };
        return next(err);
      });
  }
  
}
