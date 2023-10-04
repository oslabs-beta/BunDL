async query(req, res, next) {

  const {proto, operationType, frags} = res.locals.parsed AST ? res.locals.parsed AST : TraverseAndParseAST(AST)

  const prototype = Object.keys(frags).length > 0 ? addProtoWithFrag(proto,frags) : proto;

  const prototypeKeys = Object.keys(prototype);
}


function extractAST(AST){
  const result = {
    operationType: '',
    fields: [],
    fragments: {},
    variables: {},
    aliases: {},
  }
  
  function traverse(node) {
    switch (node.kind) {
      // starting at the root node is where operationdefinition can be found
      case 'OperationDefinition':
      // set the operationType property to the operation definition
        result.operationType = node.operation;
        
        node.selectionSet.selections.forEach(traverse);
        break;

      case 'Field':
        const fieldName = node.alias ? node.alias.value : node.name.value;
        result.fields.push(fieldName);

        if(node.alias) {
          result.aliases[node.name.value] = node.alias.value
        }

        if(node.arguments && node.arguments.length > 0) {
          node.arguments.forEach(arg => {
            if(arg.kind === 'Argument' && arg.value.kind !== 'Variable'){
              if(!result.variables[fieldName]) {
                result.variables[fieldName] = {};
              }
              result.variables[fieldName][arg.name.value] = arg.value.value;
            }
          });
        }
        if(node.selectionSet) {
          node.selectionSet.selections.forEach(traverse);
        }
        break;

        case 'FragmentSpread':
          result.fragments[node.name.value] = true;
          break;

       case 'VariableDefinition':
        result

    }
  }
traverse(AST);

return results;
}


