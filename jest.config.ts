import { pathsToModuleNameMapper } from "ts-jest/utils";

import { compilerOptions } from "./tsconfig.json";

export default {
  // Stop running tests after `n` failures
  bail: true,

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/src/",
  }),

  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest",

  // The test environment that will be used for testing
  // testEnvironment: "jest-environment-node",
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/*.spec.ts"],

  // A list of paths to modules that run some code to configure or set up the testing environment.
  setupFiles: ["dotenv/config", "reflect-metadata"],
};
