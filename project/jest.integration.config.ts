import type { Config } from "jest";

const config: Config = {
  displayName: "integration",
  testEnvironment: "node",
  testMatch: ["**/__tests__/integration/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react",
        },
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/integration/setup/jest.setup.ts"],
  testTimeout: 30000,
  clearMocks: true,
  collectCoverage: false,
  maxWorkers: 1,
};

export default config;
