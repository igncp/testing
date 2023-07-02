import { ApolloServer } from "apollo-server";

export default async () => {
  const graphqlServer = (global as any).server as ApolloServer;

  await graphqlServer.stop();
};
