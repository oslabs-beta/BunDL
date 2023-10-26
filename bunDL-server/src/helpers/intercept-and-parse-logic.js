const { parse } = require('graphql');

const interceptQueryAndParse = async (request) => {
  // Check if there's a query in the request body and it's a string

  // * done? todo: review and refactor

  if (!request || typeof request !== 'string') {
    throw new Error('No query found on request body or query is not a string.');
  }

  // You can enhance this further as needed.
  // const sanitizedQuery = request.trim();
  const sanitizedQuery = request;
  console.log('sanitizedQuery', sanitizedQuery);
  let AST;
  try {
    // Parse the sanitized query to produce the AST
    AST = parse(sanitizedQuery);
  } catch (error) {
    throw new Error('Error parsing the GraphQL query: ' + error.message);
  }

  // currently NOT USED: variableValues -- potential use case: dynamic variables, but static variables want to store as keys (marker)
  const variableValues = request.variables || {};
  // Return the AST and sanitized query
  return { AST, sanitizedQuery, variableValues };
};

export default interceptQueryAndParse;
