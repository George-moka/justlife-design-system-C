// Metro config for the Expo app inside the pnpm monorepo.
// - watch the whole workspace so edits in packages/* hot-reload on the device (Fast Refresh)
// - resolve modules from the app first, then the workspace root
// - follow pnpm's symlinks
// - FORCE single copies of React + the native modules to the APP's versions for EVERY importer.
//   `@justlife/ui` lives in packages/ui and its own node_modules pin React 18 / RN 0.76; without this,
//   Metro's hierarchical lookup resolves those for ui's source → the bundle mixes React/RN versions →
//   "two Reacts" (invalid hook calls) and native mismatches (PlatformConstants / RNSVGLinearGradient
//   "could not be found in the native binary"). `extraNodeModules` is NOT enough — it only fills in
//   FAILED resolutions; a custom `resolveRequest` is what overrides a *successful* one.
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

// Packages that MUST be a single instance, pinned to the app's copy (the SDK-54 native side).
// `expo-blur` and `expo-glass-effect` are imported by @justlife/ui's native GlassSurface but only
// installed here in the app, so redirect them here too (ui has only type shims, no runtime copy).
const FORCE_SINGLE = ['react', 'react-native', 'react-native-svg', 'react-native-safe-area-context', 'expo-blur', 'expo-glass-effect'];
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
