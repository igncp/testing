import { run } from "./graphql-server";

const port = Number(process.env.PORT) || 8080;

run(port).then(() => {
  console.log(`Server ready at: http://localhost:${port}`);
});
