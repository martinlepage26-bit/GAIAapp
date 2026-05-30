// Babel config for the GAIA Expo project.
//
// `babel-preset-expo` is the standard Expo preset that handles JSX, TypeScript,
// Flow, Reanimated and the new architecture transforms.
//
// We add `babel-plugin-transform-import-meta` so that npm packages publishing
// ESM bundles that read `import.meta.env` (e.g. zustand 4.x's middleware/vanilla
// .mjs entries) still work when Metro resolves them on the web target.
// Without this, Metro's web bundler emits the `import.meta` token verbatim and
// the browser throws "Cannot use 'import.meta' outside a module".
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Replace `import.meta.env`/`import.meta.url` references with safe
      // CommonJS equivalents so they no longer trigger a runtime parse error.
      ['babel-plugin-transform-import-meta', { module: 'ES6' }],
    ],
  };
};
