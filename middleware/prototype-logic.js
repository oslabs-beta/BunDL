async query(req, res, next) {

  const {proto, operationType, frags} = res.locals.parsed AST ? res.locals.parsed AST : TraverseAndParseAST(AST)

  const prototype = Object.keys(frags).length > 0 ? addProtoWithFrag(proto,frags) : proto;

  const prototypeKeys = Object.keys(prototype);
}

function TraverseAST() {
  const extractedData = {
    operationType: '',
    fields: [],
    fragments: {},
    variables: AST.definitions.filter(type => type.kind === 'VariableDefinition')
  };
}


