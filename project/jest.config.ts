import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/.next/", "/__tests__/integration/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1", // remove if you don't use "@/..."
  },
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    // Exclusions
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/coverage/**",
    // Next.js app directory - pages and layouts (better tested with E2E)
    "!app/**/page.tsx",
    "!app/**/layout.tsx",
    "!app/page.tsx",
    // API routes (integration points, better tested with E2E)
    "!app/api/**",
    // Type-only files
    "!app/**/*types.{ts,tsx}",
    "!app/_types/**",
    "!components/**/types.{ts,tsx}",
    // Mock data and test utilities
    "!**/*mock*.{ts,tsx}",
    "!**/mockData.{ts,tsx}",
    "!app/services/components/UserServiceTester.tsx",
    // Database and external service clients
    "!lib/db.ts",
    "!lib/supabase/**",
    // Next.js config files
    "!next.config.ts",
    "!middleware.ts",
  ],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};

export default createJestConfig(config);
