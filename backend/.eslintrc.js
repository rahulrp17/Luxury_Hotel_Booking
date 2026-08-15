/**
 * Minimal ESLint config for the Express/Mongoose backend (CommonJS, Node).
 *
 * The repo ships `eslint@8` with a `lint` script but had no config file, so
 * `npm run lint` crashed with "couldn't find a configuration file". This is a
 * deliberately small config: `eslint:recommended` plus Node globals and a few
 * pragmatic relaxations for the existing codebase. No application behavior is
 * changed — this only makes static analysis actually run.
 */
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "commonjs",
  },
  rules: {
    // Common in handler/service code (e.g. req/res placeholders).
    "no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
    ],
    // Forgiving on total line length (existing codebase uses long template strings).
    "max-len": "off",
  },
  ignorePatterns: ["node_modules/", "dist/", "coverage/"],
};
