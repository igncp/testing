import { ApolloServer } from "apollo-server";
import { resolvers, typeDefs } from "./graphql-schema";

const run = (port: number) => {
  return new Promise((resolve) => {
    const server = new ApolloServer({ resolvers, typeDefs });

    server.listen({ port }, () => {
      resolve(server);
    });
  });
};

export { run };
