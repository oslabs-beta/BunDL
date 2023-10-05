

async query(req, res, next) {

  const {proto, operationType, frags} = res.locals.parsed AST ? res.locals.parsed AST : extractAST(AST)

  const prototype = Object.keys(frags).length > 0 ? addProtoWithFrag(proto,frags) : proto;

  const cacheKey = JSON.stringify(prototype);

  const cachedData = cache[cacheKey];
  if(cachedData){
    res.locals.data = cachedData;
    return next();
  }
}

function extractAST(AST){
  let operationType = '',
  const path = [];
  const proto = {
    fields: {},
    frags: {},
    operation: '',
  };

  visit(AST, {
    OperationDefinition(node) {
      operationType = node.operation;
      proto.operation = operationType;
      if (operationType === 'subscription') {
        operationType = 'noBuns';
        BREAK;  // halt traversal
      }
    },
    Argument(node) {
      if (node.value.kind === 'Variable' && operationType === 'query') {
        operationType = 'noBuns';
        BREAK;  // halt traversal
      }
    },
    Field: {
      enter(node) {
        const fieldName = node.alias ? node.alias.value : node.name.value;
  
        if (node.name.value.includes('__')) {
          operationType = 'noBuns';
          BREAK;  // halt traversal
        }

        proto.fields[fieldName] = true;
  
        // Navigate to the current level in the proto based on the path.
        let currentLevel = proto.fields;
        for (const level of path) {
          currentLevel = currentLevel[level];
        }
        const fieldObj = {
          arguments: {},
        };
        node.arguments.forEach((arg) => {
          fieldObj.arguments[arg.name.value] = arg.value.value;
        });

        // Initialize a new object for the field in the proto.
        currentLevel[fieldName] = fieldObj;
        path.push(fieldName);  // Push current field to path.
      },
      leave() {
        path.pop();  // Pop the current field from path.
      }
    },
    FragmentSpread(node) {
      proto.frags[node.name.value] = true;
    },
    SelectionSet: {
      enter(node, key, parent) {
        
      }
    }
  });

  return { proto, operationType };
}

const cache = {};
// added this just for me to visualize it better

function addProtoWithFrag(proto, frags) {


  
  return proto;
}
