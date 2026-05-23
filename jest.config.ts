import type { Config } from "jest";

const config: Config = {
  projects: [
    {
      displayName: "server",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/server/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
    },
    {
      displayName: "client",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/src/features/**/*.test.ts?(x)",
        "<rootDir>/src/shared/**/*.test.ts?(x)",
        "<rootDir>/src/app/**/*.test.ts?(x)",
      ],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    },
  ],
};

export default config;
