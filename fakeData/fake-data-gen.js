import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

const uri =
  'mongodb+srv://apwicker:5QGUvCSrLZSswi7h@gradassessmentcluster.ki6oxrk.mongodb.net/';


const client = new MongoClient(uri);

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
