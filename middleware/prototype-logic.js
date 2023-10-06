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
    fragsDefinitions: {},
    operation: '',
    type: null,
  };
  

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
        return BREAK;
      }
    },
    Argument(node) {
      if (node.value.kind === 'Variable' && operationType === 'query') {
        operationType = 'noBuns';
        return BREAK;
      }

      function deepCheckArg(arg) {
        if (["NullValue", "ObjectValue", "ListValue"].includes(arg.kind)) {
          operationType = "noBuns";
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
        const fieldName = node.alias? node.name.value : node.name.value;
        path.push(fieldName);

        
        function setNestedProperty(obj, pathArray, value) {
          let current = obj;
          for (let i = 0; i < pathArray.length - 1; i++) {
            if (!current[pathArray[i]]) current[pathArray[i]] = {};
            current = current[pathArray[i]];
          }
          current[pathArray[pathArray.length - 1]] = value;
        }


        if (['id', '_id', 'ID', 'Id'].includes(node.name.value)) {
          setNestedProperty(proto.fields, path, { id: true });
        } else {
          setNestedProperty(proto.fields, path, {});
        }

      },
      leave() {
        path.pop();
      }
    },
    FragmentDefinition(node) {
      proto.fragsDefinitions[node.name.value] = {};
      for (const field of node.selectionSet.selections) {
        if (field.kind !== "InlineFragment") {
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
          proto.type = parent.typeCondition.name.value;
        }
      },
      leave() {
        path.pop();
      }
    }
  });

  if (
    !proto.fields.id &&
    !proto.fields._id &&
    !proto.fields.ID &&
    !proto.fields.Id
  ) {
    operationType = "noID";
  }

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
