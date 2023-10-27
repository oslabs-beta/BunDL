//puchdb has to be in the server to make the call to couchdb to sync with couchdb

const PouchDB = require('pouchdb');
const db = new PouchDB('users');

const storeResultsInPouchDB = (queryResults) => {
  console.log(queryResults.users);
  const dataWithID = queryResults.users.map((user, index) => {
    return {
      _id: `user_${index}`,
      ...user,
    };
  });

  const updatedResults = {
    data: {
      users: dataWithID,
    },
  };

  console.log(updatedResults);

  if (updatedResults.users.length === 1) {
    db.put(user)
      .then((response) => {
        console.log('Document inserted successfully', response);
      })
      .catch((error) => {
        console.log('Error inserting document', error);
      });
  } else {
    db.bulkDocs(updatedResults.data.users)
      .then((response) => {
        console.log('Documents inserted successfully', response);
      })
      .catch((error) => {
        console.log('Error inserting documents', error);
      });
  }
};

export default storeResultsInPouchDB;
