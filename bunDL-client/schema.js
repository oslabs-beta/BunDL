import {
  couchDBSchema,
  documentValidation,
} from '../bunDL-server/src/couchSchema.js';
import { BasicAuthenticator } from 'ibm-cloud-sdk-core';
import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
} from 'graphql';
const { faker } = require('@faker-js/faker');

import { db } from '../bunDL-server/src/server/bun-server';

const generateFakeData = (num) => {
  const companyProducts = [];

  for (let i = 0; i < num; i++) {
    const companyProduct = {
      company: faker.company.name(),
      city: faker.location.ciy(),
      state: faker.location.state(),
      department: {
        departmentName: faker.commerce.department(),
        product: {
          productName: faker.commerce.product(),
          productDescription: faker.commerce.productDescription(),
          price: faker.commerce.price(),
        },
      },
    };
    companyProducts.push(companyProduct);
  }
  return companyProducts;
};

// Function to populate the database with fake users
export const populateDB = async (db, numberOfUsers) => {
  const fakeData = [];

  // Generate fake users
  for (let i = 0; i < numberOfUsers; i++) {
    fakeData.push(generateFakeData(numberOfUsers));
  }

  // Bulk insert into PouchDB
  try {
    const response = await db.bulkDocs(fakeData);
    console.log('Database populated:', response);
  } catch (err) {
    console.error('Error populating database:', err);
  }
};
//populateDB(db,10)

// GraphQL Types

const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: () => ({
    id: { type: GraphQLID },
    productName: { type: GraphQLString },
    productDescription: { type: GraphQLString },
    price: { type: GraphQLString },
  }),
});

const DepartmentType = new GraphQLObjectType({
  name: 'Department',
  fields: () => ({
    id: { type: GraphQLID },
    departmentName: { type: GraphQLString },
    products: {
      type: new GraphQLList(ProductType),
      resolve: (parent, args) => db.get(args.id),
    },
  }),
});

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLID },
    company: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    departments: {
      type: new GraphQLList(DepartmentType),
      resolve: (parent, args) => db.get(args.id),
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
