module.exports = {
  preset: "jest-expo",
  setupFilesAfterSetup: ["./jest/setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!(expo|react-native|@supabase|nativewind|@studentos)/)",
  ],
  moduleNameMapper: {
    "^@studentos/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};
