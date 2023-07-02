import fs from "node:fs";
import { execSync } from "node:child_process";
import { run } from "../src/graphql-server";
import { apolloServerPort } from "./utils";

export default async () => {
  try {
    fs.unlinkSync("./prisma/test.db");
  } catch {
    // Do nothing if the file doesn't exist
  }
  execSync("npx prisma migrate dev --name init --preview-feature");
  (global as any).server = await run(apolloServerPort);
};
