import { typeDefs, resolvers } from './schema';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.port || 4000;

// await startStandaloneServer(server, {
//   listen: { port: PORT },
// });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at:${url}`);
});

// console.info(`🚀  Server ready at: http://localhost:${PORT}/graphql`);
