const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo root
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve modules from both local and monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure Metro can find packages hoisted to the monorepo root
config.resolver.disableHierarchicalLookup = false;

module.exports = config;