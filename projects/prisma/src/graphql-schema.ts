import { gql } from "apollo-server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const typeDefs = gql`
  type User {
    email: String
    id: ID!
    name: String!
  }

  type Query {
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String, email: String!): User!
  }
`;

const resolvers = {
  Query: {
    user: (_parent: any, args: any) => {
      return prisma.user.findUnique({
        where: {
          id: Number(args.id),
        },
      });
    },
  },
  Mutation: {
    createUser: (_parent: any, args: any) => {
      const user = prisma.user.create({
        data: {
          name: args.name || "",
          email: args.email,
        },
      });

      return user;
    },
  },
  User: {
    email: (parent: any) => parent.email,
    id: (parent: any) => parent.id,
    name: (parent: any) => parent.name,
  },
};

export { resolvers, typeDefs };
