const { parse } = require('graphql');

const interceptQueryAndParse = (req, res, next) => {
  console.log('🐱 query intercepted 🐱');
  console.log(req.body.query);
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
    .replace(/[^a-zA-Z0-9_{}():,\s]/g, '');
  console.log(`the sanitized query is: ${sanitizedQuery}`);
  res.locals.query = sanitizedQuery;
  req.body.query = sanitizedQuery;

  try {
    // invoke the `parse` method built into GraphQL to create Abstract Syntax Tree from sanitized query
    const AST = parse(sanitizedQuery);
    res.locals.parsedAST = AST;
    console.log(`the ast looks like: ${AST}`);
  } catch (error) {
    console.error('Error parsing the GraphQL query: ', error);
    return res.status(400).json({ error: 'Invalid GraphQL query' });
  } finally {
    console.log('this is finally');
    // Return sanitizedQuery in string format and the AST to the server
    // return res.status(200).json(sanitizedQuery);
    return next();
  }
};

module.exports = interceptQueryAndParse;
