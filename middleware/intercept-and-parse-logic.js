const { parse } = require('graphql');

const interceptQueryAndParse = (req) => {
  console.log('🐱 query intercepted 🐱');
  // Check if there's a query in the request body and it's a string
  if (!req.body.query || typeof req.body.query !== 'string') {
    throw new Error('No query found on request body or query is not a string.');
  }

  // You can enhance this further as needed.
  const sanitizedQuery = req.body.query
    .trim()
    .replace(/[^a-zA-Z0-9_{}():,!@.\s]/g, '');

  let AST;
  try {
    // Parse the sanitized query to produce the AST
    AST = parse(sanitizedQuery);
  } catch (error) {
    throw new Error('Error parsing the GraphQL query: ' + error.message);
  }

  // Return the AST and sanitized query
  return { AST, sanitizedQuery };
};

export default interceptQueryAndParse;
