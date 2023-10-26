import bunDLClient from 'bundl-client';

const sampleSchema = `
query {
  company (id: "company0"){ 
     company 
     city 
     state 
     department (id: "department0") {
         departmentName 
         }
     } 
 }
`;

const bunCache = new bunDLClient(sampleSchema);

async function testBunCache() {
  // Test 1: First query (should be a cache miss)
  const query1 = `
    query {
      hello
    }
  `;

  let response = await bunCache.query('/graphql', query1);
  console.log('Test 1:', response); // Should log the GraphQL response and cache data

  // Test 2: Running the same query (should be a cache hit)
  response = await bunCache.query(query1);
  console.log('Test 2:', response); // Should log the GraphQL response and cache data with 'cache: hit'

  // Add more test queries as needed to thoroughly test your caching solution.
}

testBunCache().catch((err) => console.error('Error during test:', err));
