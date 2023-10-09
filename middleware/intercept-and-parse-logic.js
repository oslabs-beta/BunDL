const { parse } = require('graphql');

const interceptQueryAndParse = (req) => {
  console.log('🐱 query intercepted 🐱');
  console.log('this is req.body.query: ', req.body.query);
  // Check if there's a query in the request body and it's a string
  if (!req.body.query || typeof req.body.query !== 'string') {
    throw new Error('No query found on request body or query is not a string.');
  }

  // You can enhance this further as needed.
  const sanitizedQuery = req.body.query.trim();

  let AST;
  try {
    // Parse the sanitized query to produce the AST
    AST = parse(sanitizedQuery);
  } catch (error) {
    throw new Error('Error parsing the GraphQL query: ' + error.message);
  }

  const variableValues = req.body.variables || {};

  // Return the AST and sanitized query
  return { AST, sanitizedQuery, variableValues };
};

export default interceptQueryAndParse;
