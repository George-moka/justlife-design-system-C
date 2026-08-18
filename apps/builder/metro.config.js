// Metro config for the Expo app inside the pnpm monorepo.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = false;
const FORCE_SINGLE = ['react', 'react-dom', 'react-native', 'react-native-svg', 'react-native-safe-area-context', 'expo-blur', 'expo-glass-effect'];
const forcedDir = Object.fromEntries(FORCE_SINGLE.map((p) => [p, path.resolve(projectRoot, 'node_modules', p)]));
config.resolver.extraNodeModules = { ...(config.resolver.extraNodeModules || {}), ...forcedDir };
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const name of FORCE_SINGLE) {
    if (moduleName === name || moduleName.startsWith(name + '/')) {
      const redirected = forcedDir[name] + moduleName.slice(name.length);
      const resolve = defaultResolveRequest || context.resolveRequest;
      return resolve(context, redirected, platform);
    }
  }
  const resolve = defaultResolveRequest || context.resolveRequest;
  return resolve(context, moduleName, platform);
};
module.exports = config;