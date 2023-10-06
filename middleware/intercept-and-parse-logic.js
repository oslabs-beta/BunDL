const { parse } = require('graphql');
const path = require('path');

const interceptQueryAndParse = (req, res, next) => {
  console.log('🐱 query intercepted 🐱');
  if (!req.body.query || typeof req.body.query !== 'string') {
    const errorObj = {
      log: 'Error: no query found on request body!',
      status: 400,
      message: {
        error:
          'An error occured while intercepting and parsing the request query.',
      },
    };
    return res.status(errorObj.status).json(errorObj.message);
  }
  // sanitize request body
  const sanitizedQuery = req.body.query
    .trim()
    .replace(/[^a-zA-Z0-9_{}():,!@.\s]/g, '');
  res.locals.query = sanitizedQuery;
  req.body.query = sanitizedQuery;
  try {
    // invoke the `parse` method built into GraphQL to create Abstract Syntax Tree from sanitized query
    const AST = parse(sanitizedQuery);
    res.locals.parsedAST = AST;
    const astString = JSON.stringify(AST, null, 2);
    const astStringPath = path.join(__dirname, 'astOutput.json');
    Bun.write(astStringPath, astString);
    console.log('Query converted to AST and saved to: ', astStringPath);
  } catch (error) {
    console.error('Error parsing the GraphQL query: ', error);
    return res.status(400).json({ error: 'Invalid GraphQL query' });
  }
  // Return sanitizedQuery in string format and the AST to the server
  // return res.status(200).json(sanitizedQuery);
  return next();
};

module.exports = interceptQueryAndParse;
