const { MongoClient } = require('mongodb');
const faker = require('faker');

const uri =
  'mongodb+srv://apwicker:5QGUvCSrLZSswi7h@gradassessmentcluster.ki6oxrk.mongodb.net/';

const client = new MongoClient(uri);

const generateFakeUsers = (num) => {
  const users = [];

  for (let i = 0; i < num; i++) {
    const user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip: faker.address.zipCode(),
        country: faker.address.country(),
      },
    };
    users.push(user);
  }
  return users;
};

async function insertUsersToDB(users) {
  try {
    await client.connect();

    const database = client.db('bundl-test');
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
