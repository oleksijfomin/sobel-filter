const prettierConfigs = require('./.prettierrc.js');

module.exports = {
  extends: 'airbnb-typescript-prettier',
  plugins: ["jsx-a11y", "@typescript-eslint/eslint-plugin"],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    "prettier/prettier": ["error", prettierConfigs],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          "**/*.test.{js,ts,jsx,tsx}",
        ],
      },
    ],
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": ["./tsconfig.json"]
  },
};
