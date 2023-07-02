module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: [`<rootDir>/jest-shim.js`],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
