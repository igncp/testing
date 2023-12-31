import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  webServer: {
    command: process.env.SKIP_BUILD === "true" ? "npm start" : "npm run full",
    url: "http://localhost:3000",
    timeout: 120 * 1000,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
};

export default config;
