import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { apolloServerPort } from "./utils";

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.user.deleteMany();
});

describe("basic prisma", () => {
  it("can create new records", async () => {
    const newUser = await prisma.user.create({
      data: {
        name: "Alice",
        email: "alice@prisma.io",
      },
    });

    const users = await prisma.user.findMany();

    expect(users).toEqual([newUser]);
    expect(newUser).toEqual({
      createdAt: expect.any(Date),
      email: "alice@prisma.io",
      id: 1,
      name: "Alice",
    });
  });
});

describe("graphql", () => {
  const getUser = async (id: number) => {
    return await fetch("http://localhost:" + apolloServerPort, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{ user(id: ${id}) { email } }`,
      }),
    }).then((r) => r.json());
  };

  it("returns the expected data when no records", async () => {
    const result = await getUser(0);

    expect(result).toEqual({
      data: {
        user: null,
      },
    });
  });

  it("returns the expected data when records", async () => {
    await prisma.user.create({
      data: {
        name: "Alice",
        email: "alice@prisma.io",
      },
    });

    const users = await prisma.user.findMany();

    const result = await getUser(users[0].id);

    expect(result).toEqual({
      data: {
        user: {
          email: "alice@prisma.io",
        },
      },
    });
  });
});
