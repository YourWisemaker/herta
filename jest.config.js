/**
 * Jest configuration for Herta.js
 */

module.exports = {
  // Define test files pattern
  testMatch: [
    "**/test/**/*.test.js",
    "**/test/**/*.spec.js",
    "**/__tests__/**/*.js",
    "**/*.spec.js"
  ],
  
  // Files to exclude from testing
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/commands/erudition/test.js"
  ],
  
  // Display test information in different formats
  verbose: true,
  
  // Collect test coverage information
  collectCoverage: false,
  
  // Test environment
  testEnvironment: "node"
};
