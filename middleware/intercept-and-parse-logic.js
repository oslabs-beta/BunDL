const interceptQueryAndParse = () => {
  if (!req.body.query) {
    const errorObj = {
      log: 'Error: no query found on request body!',
      status: 400;
      message: {
        error: 'An error occured while intercepting and parsing the request query.',
      }
    };
    return resolve.status(errorObj.status.json(errorObj.message));
  }
};

module.exports = interceptQueryAndParse;
