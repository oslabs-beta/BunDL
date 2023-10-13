import { faker } from '@faker-js/faker';
import PouchDB from 'pouchdb';

const db = new PouchDB('http://127.0.0.1:5984/database-test/');

db.info()
  .then((info) => {
    console.log(info);
  })
  .catch((err) => {
    console.error('Error connecting to CouchDB', err);
  });

const generateFakeUsers = (num) => {
  const users = [];

  for (let i = 0; i < num; i++) {
    const user = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip: faker.location.zipCode(),
        country: faker.location.country(),
      },
    };
    users.push(user);
  }
  return users;
};

async function insertUsersToDB(users) {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB.');
    const database = client.db('test');
    const collection = database.collection('test-Data');

    const result = await collection.insertMany(users);
    console.log(`successfully inserted ${result.insertedCount} users.`);
  } catch (error) {
    console.error('Error inserting users: ', error);
  } finally {
    await client.close();
  }
}

const fakeUsers = generateFakeUsers(100);
insertUsersToDB(fakeUsers);
