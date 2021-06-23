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
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "sort-imports": "off",
    "require-await": "off",
    "@typescript-eslint/require-await": "warn",
    "@typescript-eslint/no-floating-promises": "warn",
    "quotes": ["warn", "single"],
    "no-restricted-globals": ["error", "history"]
  },
  ignorePatterns: [
    "test",
    ".eslintrc.js",
    "jest.config.ts",
    "babel.config.js",
    "webpack.*"
  ]
};
