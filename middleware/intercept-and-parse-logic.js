const interceptQueryAndParse = (req, res) => {
  console.log('🐱query intercepted🐱');

  if (!req.body.query) {
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

  // Convert request query to Query Object

  return res.status(200).json(req.body.query);
};

// Helper function to

module.exports = interceptQueryAndParse;
