module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname + "/lib",
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "../../node_modules/@standardnotes/config/src/.eslintrc"
  ],
  rules: {
    "sort-imports": "off",
    "require-await": "off",
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "quotes": ["warn", "single"],
    "no-restricted-globals": ["error", "history"],
    "@typescript-eslint/no-explicit-any": ["warn", { "ignoreRestArgs": true }]
  },
  ignorePatterns: [
    "test",
    ".eslintrc.js",
    "jest.unit.config.ts",
    "jest.e2e.config.ts",
    "babel.config.js",
    "webpack.*"
  ]
};
