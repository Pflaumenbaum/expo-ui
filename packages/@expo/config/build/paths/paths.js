"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertEntryPointToRelative = convertEntryPointToRelative;
exports.ensureSlash = ensureSlash;
exports.getFileWithExtensions = getFileWithExtensions;
exports.getMetroServerRoot = getMetroServerRoot;
exports.getMetroWorkspaceGlobs = getMetroWorkspaceGlobs;
exports.getPossibleProjectRoot = getPossibleProjectRoot;
exports.resolveEntryPoint = resolveEntryPoint;
exports.resolveRelativeEntryPoint = void 0;
function _fs() {
  const data = _interopRequireDefault(require("fs"));
  _fs = function () {
    return data;
  };
  return data;
}
function _path() {
  const data = _interopRequireDefault(require("path"));
  _path = function () {
    return data;
  };
  return data;
}
function _resolveFrom() {
  const data = _interopRequireDefault(require("resolve-from"));
  _resolveFrom = function () {
    return data;
  };
  return data;
}
function _resolveWorkspaceRoot() {
  const data = require("resolve-workspace-root");
  _resolveWorkspaceRoot = function () {
    return data;
  };
  return data;
}
function _env() {
  const data = require("./env");
  _env = function () {
    return data;
  };
  return data;
}
function _extensions() {
  const data = require("./extensions");
  _extensions = function () {
    return data;
  };
  return data;
}
function _Config() {
  const data = require("../Config");
  _Config = function () {
    return data;
  };
  return data;
}
function _Errors() {
  const data = require("../Errors");
  _Errors = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// https://github.com/facebook/create-react-app/blob/9750738cce89a967cc71f28390daf5d4311b193c/packages/react-scripts/config/paths.js#L22
function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substring(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}
function getPossibleProjectRoot() {
  return _fs().default.realpathSync(process.cwd());
}
const nativePlatforms = ['ios', 'android'];

/** @returns the absolute entry file for an Expo project. */
function resolveEntryPoint(projectRoot, {
  platform,
  pkg = (0, _Config().getPackageJson)(projectRoot)
} = {}) {
  const platforms = !platform ? [] : nativePlatforms.includes(platform) ? [platform, 'native'] : [platform];
  const extensions = (0, _extensions().getBareExtensions)(platforms);

  // If the config doesn't define a custom entry then we want to look at the `package.json`s `main` field, and try again.
  const {
    main
  } = pkg;
  if (main && typeof main === 'string') {
    // Testing the main field against all of the provided extensions - for legacy reasons we can't use node module resolution as the package.json allows you to pass in a file without a relative path and expect it as a relative path.
    let entry = getFileWithExtensions(projectRoot, main, extensions);
    if (!entry) {
      // Allow for paths like: `{ "main": "expo/AppEntry" }`
      entry = resolveFromSilentWithExtensions(projectRoot, main, extensions);
      if (!entry) throw new (_Errors().ConfigError)(`Cannot resolve entry file: The \`main\` field defined in your \`package.json\` points to an unresolvable or non-existent path.`, 'ENTRY_NOT_FOUND');
    }
    return entry;
  }

  // Check for a root index.* file in the project root.
  const entry = resolveFromSilentWithExtensions(projectRoot, './index', extensions);
  if (entry) {
    return entry;
  }
  try {
    // If none of the default files exist then we will attempt to use the main Expo entry point.
    // This requires `expo` to be installed in the project to work as it will use `node_module/expo/AppEntry.js`
    // Doing this enables us to create a bare minimum Expo project.

    // TODO(Bacon): We may want to do a check against `./App` and `expo` in the `package.json` `dependencies` as we can more accurately ensure that the project is expo-min without needing the modules installed.
    return (0, _resolveFrom().default)(projectRoot, 'expo/AppEntry');
  } catch {
    throw new (_Errors().ConfigError)(`The project entry file could not be resolved. Define it in the \`main\` field of the \`package.json\`, create an \`index.js\`, or install the \`expo\` package.`, 'ENTRY_NOT_FOUND');
  }
}

// Resolve from but with the ability to resolve like a bundler
function resolveFromSilentWithExtensions(fromDirectory, moduleId, extensions) {
  for (const extension of extensions) {
    const modulePath = _resolveFrom().default.silent(fromDirectory, `${moduleId}.${extension}`);
    if (modulePath?.endsWith(extension)) {
      return modulePath;
    }
  }
  return _resolveFrom().default.silent(fromDirectory, moduleId) || null;
}

// Statically attempt to resolve a module but with the ability to resolve like a bundler.
// This won't use node module resolution.
function getFileWithExtensions(fromDirectory, moduleId, extensions) {
  const modulePath = _path().default.join(fromDirectory, moduleId);
  if (_fs().default.existsSync(modulePath)) {
    return modulePath;
  }
  for (const extension of extensions) {
    const modulePath = _path().default.join(fromDirectory, `${moduleId}.${extension}`);
    if (_fs().default.existsSync(modulePath)) {
      return modulePath;
    }
  }
  return null;
}

/** Get the Metro server root, when working in monorepos */
function getMetroServerRoot(projectRoot) {
  if (_env().env.EXPO_NO_METRO_WORKSPACE_ROOT) {
    return projectRoot;
  }
  return (0, _resolveWorkspaceRoot().resolveWorkspaceRoot)(projectRoot) ?? projectRoot;
}

/**
 * Get the workspace globs for Metro's watchFolders.
 * @note This does not traverse the monorepo, and should be used with `getMetroServerRoot`
 */
function getMetroWorkspaceGlobs(monorepoRoot) {
  return (0, _resolveWorkspaceRoot().getWorkspaceGlobs)(monorepoRoot);
}

/**
 * Convert an absolute entry point to a server or project root relative filepath.
 * This is useful on Android where the entry point is an absolute path.
 */
function convertEntryPointToRelative(projectRoot, absolutePath) {
  // The project root could be using a different root on MacOS (`/var` vs `/private/var`)
  // We need to make sure to get the non-symlinked path to the server or project root.
  return _path().default.relative(_fs().default.realpathSync(getMetroServerRoot(projectRoot)), _fs().default.realpathSync(absolutePath));
}

/**
 * Resolve the entry point relative to either the server or project root.
 * This relative entry path should be used to pass non-absolute paths to Metro,
 * accounting for possible monorepos and keeping the cache sharable (no absolute paths).
 */
const resolveRelativeEntryPoint = (projectRoot, options) => {
  return convertEntryPointToRelative(projectRoot, resolveEntryPoint(projectRoot, options));
};
exports.resolveRelativeEntryPoint = resolveRelativeEntryPoint;
//# sourceMappingURL=paths.js.map