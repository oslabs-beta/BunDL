import {
  couchDBSchema,
  documentValidation,
} from '../bunDL-server/couchSchema.js';
import { BasicAuthenticator } from 'ibm-cloud-sdk-core';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
} from 'graphql';
const { faker } = require('@faker-js/faker');

import { db } from '../server/bun-server.js';

// const doc = await db.get('department0');
// console.log(db);
// console.log('this is the doc:', doc);

// db.destroy()
//   .then(() => {
//     console.log('Database deleted successfully.');
//   })
//   .catch((err) => {
//     console.error('Error deleting database:', err);
//   });

const sync = db.sync(remoteDB, { live: true });
sync.on('error', function (err) {
  console.error('Sync Error', err);
});

const generateFakeData = (num) => {
  const documents = [];

  for (let i = 0; i < num; i++) {
    const companyId = `company${i}`;
    const departmentId = `department${i}`;
    const productId = `product${i}`;
    const company = {
      _id: companyId,
      type: 'Company',
      company: faker.company.name(),
      city: faker.location.city(),
      state: faker.location.state(),
      departments: [departmentId],
    };
    const department = {
      _id: departmentId,
      type: 'Department',
      departmentName: faker.commerce.department(),
      products: [productId],
    };
    const product = {
      _id: productId,
      type: 'Product',
      productName: faker.commerce.product(),
      productDescription: faker.commerce.productDescription(),
      price: faker.commerce.price(),
    };

    documents.push(company, department, product);
  }
  return documents;
};

// Function to populate the database with fake users
export const populateDB = async (db, numberOfUsers) => {
  const fakeData = [];

  // Generate fake users
  for (let i = 0; i < numberOfUsers; i++) {
    fakeData.push(...generateFakeData(i));
  }

  // Bulk insert into PouchDB
  try {
    const response = await db.bulkDocs(fakeData);
    console.log('Database populated:', response);
  } catch (err) {
    console.error('Error populating database:', err);
  }
};
// populateDB(db, 5);

// GraphQL Types

const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: () => ({
    id: { type: GraphQLID, resolve: (product) => product._id },
    productName: { type: GraphQLString },
    productDescription: { type: GraphQLString },
    price: { type: GraphQLInt },
  }),
});

const DepartmentType = new GraphQLObjectType({
  name: 'Department',
  fields: () => ({
    id: { type: GraphQLID, resolve: (department) => department._id }, // Renamed variable
    departmentName: { type: GraphQLString },
    products: {
      type: new GraphQLList(ProductType),
      resolve: async (parent, args) => {
        const productDocs = await db.allDocs({
          keys: parent.products, // Renamed to 'products'
          include_docs: true,
        });
        return productDocs.rows.map((row) => row.doc);
      },
    },
  }),
});

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLID, resolve: (company) => company._id },
    company: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    departments: {
      type: new GraphQLList(DepartmentType),
      resolve: async (parent, args) => {
        const departmentDocs = await db.allDocs({
          keys: parent.departments,
          include_docs: true,
        });
        return departmentDocs.rows.map((row) => row.doc);
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return db.get(args.id); // pouch // queries do not reuire rev and can ignore rev
      },
    },
  },
});

//artist 2
//albums: [{id:1},{id:2},3,4]
export const schema = new GraphQLSchema({
  query: RootQuery,
});
