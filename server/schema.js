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
        apikey: 'jCfkWBoTgfqRKIYxbk9ES2ChKoE2qNxsDOz4taRO4TRJ',
        host: 'bb239217-6899-4f67-bc43-e8a61ab80e4f-bluemix.cloudantnosqldb.appdomain.cloud',
        iam_apikey_description:
          'Auto-generated for key crn:v1:bluemix:public:cloudantnosqldb:us-south:a/346615b68f04446082a512b3c612e711:44f41151-8ec7-4efd-8b54-b1eb9f927391:resource-key:2a5639de-76c1-405b-ad0d-34af191ee363',
        iam_apikey_name: 'bundl-shi',
        iam_role_crn: 'crn:v1:bluemix:public:iam::::serviceRole:Manager',
        iam_serviceid_crn:
          'crn:v1:bluemix:public:iam-identity::a/346615b68f04446082a512b3c612e711::serviceid:ServiceId-fdf3366b-6cc6-4129-a4f1-419364eaa3c1',
        password: 'ee1cb9675875f151265c60cb92b4e0c1',
        port: 443,
        url: 'https://apikey-v2-s2k9hy07di7b1my4qspcfsdg8macu69spot0cpsh8ei:ee1cb9675875f151265c60cb92b4e0c1@bb239217-6899-4f67-bc43-e8a61ab80e4f-bluemix.cloudantnosqldb.appdomain.cloud',
        username: 'apikey-v2-s2k9hy07di7b1my4qspcfsdg8macu69spot0cpsh8ei',
      },
      label: 'cloudantnosqldb',
    },
  },
};

// const sync = db.sync(remoteDB, { live: true });
// sync.on('error', function (err) {
//   console.error('Sync Error', err);
// });

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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        phoneNumber: { type: new GraphQLNonNull(GraphQLString) },
        address: {
          type: new GraphQLNonNull(AddressInputType),
          args: {
            street: { type: new GraphQLNonNull(GraphQLString) },
            city: { type: new GraphQLNonNull(GraphQLString) },
            state: { type: new GraphQLNonNull(GraphQLString) },
            zip: { type: new GraphQLNonNull(GraphQLString) },
            country: { type: new GraphQLNonNull(GraphQLString) },
          },
        },
      },
      resolve(parent, args) {
        let user = new User({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phoneNumber: args.phoneNumber,
          address: args.address,
        });
        return user.save(); // Save to MongoDB and return the saved object
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
