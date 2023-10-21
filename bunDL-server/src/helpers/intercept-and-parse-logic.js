const { parse } = require('graphql');

const interceptQueryAndParse = async (req) => {
  // console.log('🐱 query intercepted 🐱');
  // console.log('this is req.body.query: ', req.body.query);
  // Check if there's a query in the request body and it's a string
  const data = await req.json();
  //todo: review and refactor
  req.body.query = data.query;
  if (!req.body.query || typeof req.body.query !== 'string') {
    throw new Error('No query found on request body or query is not a string.');
  }

  // You can enhance this further as needed.
  const sanitizedQuery = req.body.query.trim();

  let AST;
  try {
    // Parse the sanitized query to produce the AST
    AST = parse(sanitizedQuery);
    console.log('ast', AST)
  } catch (error) {
    throw new Error('Error parsing the GraphQL query: ' + error.message);
  }

  // currently NOT USED: variableValues -- potential use case: dynamic variables, but static variables want to store as keys (marker)
  const variableValues = req.body.variables || {};
  // Return the AST and sanitized query
  return { AST, sanitizedQuery, variableValues };
};

export default interceptQueryAndParse;
