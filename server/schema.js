import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';
const { faker } = require('@faker-js/faker');

const vcapLocal = {
  services: {
    cloudantnosqldb: {
      credentials: {
        apikey: 'QTT6SHWVIWE-KV6GdC-PGZPS8kw28lwt0fBwunhFbqjP',
        host: 'bb239217-6899-4f67-bc43-e8a61ab80e4f-bluemix.cloudantnosqldb.appdomain.cloud',
        iam_apikey_description:
          'Auto-generated for key crn:v1:bluemix:public:cloudantnosqldb:us-south:a/346615b68f04446082a512b3c612e711:44f41151-8ec7-4efd-8b54-b1eb9f927391:resource-key:93dddfcd-1d05-4966-9ba8-a0ad001ec6c0',
        iam_apikey_name: 'bundl-ken',
        iam_role_crn: 'crn:v1:bluemix:public:iam::::serviceRole:Manager',
        iam_serviceid_crn:
          'crn:v1:bluemix:public:iam-identity::a/346615b68f04446082a512b3c612e711::serviceid:ServiceId-398be17c-76a8-42b3-aed5-f38ff8ba2961',
        password: 'ef39c77d041563fad50dd8806bf186c6',
        port: 443,
        url: 'https://apikey-v2-2jehgk0zb28hoy53isl47s86nu1uz6kr3zirqaa4s80k:ef39c77d041563fad50dd8806bf186c6@bb239217-6899-4f67-bc43-e8a61ab80e4f-bluemix.cloudantnosqldb.appdomain.cloud',
        username: 'apikey-v2-2jehgk0zb28hoy53isl47s86nu1uz6kr3zirqaa4s80k',
      },
      label: 'cloudantnosqldb',
    },
  },
};

const cloudantCredentials = vcapLocal.services.cloudantnosqldb.credentials;
const COUCHDB_URL = cloudantCredentials.url;
const COUCHDB_DB_NAME = 'bundl-test';

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

//id
//rev
//value
//doc {
// id
// rev
// company...
//}

// Function to populate the database with fake users
export const populateDB = async (numberOfUsers) => {
  const fakeData = [];
  // Generate fake users
  for (let i = 0; i < numberOfUsers; i++) {
    fakeData.push(...generateFakeData(i));
  }
  try {
    const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/_bulk_docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ docs: fakeData }),
    });
    const result = await response.json();
    console.log(result);
    return result;
    console.log('Database populated:', response);
  } catch (err) {
    console.error('Error populating database:', err);
  }
  // Bulk insert into PouchDB
};
// populateDB(5);

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
    product: {
      type: new GraphQLList(ProductType),
      args: { id: { type: GraphQLString } },
      resolve: async (parent, args) => {
        try {
          const queryParams = new URLSearchParams({
            keys: parent.products,
            include_docs: true,
          });
          console.log('queryParams: ', queryParams.keys);
          const departmentDocs = await fetch(
            `${COUCHDB_URL}/${COUCHDB_DB_NAME}/_all_docs?${queryParams}`
          );

          return departmentDocs.rows.map((row) => row.doc);
        } catch (error) {
          console.error(error);
        }
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
    department: {
      type: new GraphQLList(DepartmentType),
      args: { id: { type: GraphQLString } },
      resolve: async (parent, args) => {
        try {
          const queryParams = new URLSearchParams({
            keys: parent.departments,
            include_docs: true,
          });
          console.log('queryParams for company: ', queryParams.keys);
          const departmentDocs = await fetch(
            `${COUCHDB_URL}/${COUCHDB_DB_NAME}/_all_docs?${queryParams}`
          );
          console.log('in sofa');
          return departmentDocs.rows.map((row) => row.doc);
        } catch (error) {
          console.error(error);
        }
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/${args.id}`);
        console.log('in sofa rootQuery: ', response);
        const data = await response.json();
        return data;
      },
    },
    department: {
      type: DepartmentType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/${args.id}`);
        const data = await response.json();
        return data;
      },
    },
    product: {
      type: ProductType,
      args: { id: { type: GraphQLString } },
      async resolve(parent, args) {
        const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/${args.id}`);
        const data = await response.json();
        return data;
      },
    },
  },
});

const ProductInputType = new GraphQLInputObjectType({
  name: 'ProductInput',
  fields: {
    productName: { type: GraphQLString },
    productDescription: { type: GraphQLString },
    price: { type: GraphQLInt },
  },
});

const DepartmentInputType = new GraphQLInputObjectType({
  name: 'DepartmentInput',
  fields: {
    departmentName: { type: GraphQLString },
    products: { type: new GraphQLList(GraphQLID) },
  },
});

const CompanyInputType = new GraphQLInputObjectType({
  name: 'CompanyInput',
  fields: {
    company: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    departments: { type: new GraphQLList(GraphQLID) },
  },
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addProduct: {
      type: ProductType,
      args: {
        input: { type: ProductInputType },
      },
      async resolve(parent, args) {
        const productData = args.input;

        const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/_bulk_docs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ docs: [productData] }),
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return productData;
      },
    },
    addDepartment: {
      type: DepartmentType,
      args: {
        input: { type: DepartmentInputType },
      },
      async resolve(parent, args) {
        const departmentData = args.input;

        const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/_bulk_docs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ docs: [departmentData] }),
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return departmentData;
      },
    },
    addCompany: {
      type: CompanyType,
      args: {
        input: { type: CompanyInputType },
      },
      async resolve(parent, args) {
        const companyData = args.input;

        const response = await fetch(`${COUCHDB_URL}/${COUCHDB_DB_NAME}/_bulk_docs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ docs: [companyData] }),
        });
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        return companyData;
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
