const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve files from the shared directory
config.watchFolders = [path.resolve(__dirname, '../shared')];

// Ensure the shared directory can resolve node_modules from the mobile directory
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;
