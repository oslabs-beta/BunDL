const { faker } = require('@faker-js/faker');
// const PouchDB = require('pouchdb');

// Function to generate a single fake user
const generateFakeUser = () => {
  return {
    _id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    animal: faker.animal.type(),
    avatar: faker.image.avatar(),
    subscriptionTier: faker.helpers.arrayElement(['free', 'basic', 'ultimate']),
  };
};

// Function to populate the database with fake users
const populateDB = async (db, numberOfUsers) => {
  const fakeUsers = [];

  // Generate fake users
  for (let i = 0; i < numberOfUsers; i++) {
    fakeUsers.push(generateFakeUser());
  }

  // Bulk insert into PouchDB
  try {
    const response = await db.bulkDocs(fakeUsers);
    console.log('Database populated:', response);
  } catch (err) {
    console.error('Error populating database:', err);
  }
};

// Populate the database with 100 fake users
module.exports = populateDB;
