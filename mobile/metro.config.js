const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the monorepo so shared code hot reloads
config.watchFolders = [workspaceRoot];

// Resolve modules from both local and workspace node_modules (pnpm)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Ensure singletons for core React/Expo libs
const singletons = ["react", "react-native", "expo", "expo-router", "@expo/metro-runtime"];
config.resolver.extraNodeModules = singletons.reduce((acc, name) => {
  acc[name] = path.resolve(projectRoot, "node_modules", name);
  return acc;
}, {});

// Support pnpm symlinked node_modules
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
