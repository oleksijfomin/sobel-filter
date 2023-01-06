const jestBase = require('./jest-base.config');

module.exports = {
  ...jestBase,
  modulePathIgnorePatterns: ['__fixture__'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
  ],
  testMatch: [
    '<rootDir>/src/**/*.{spec,test}.{js,ts}',
  ],
  projects: ['./jest.config.js'],
};
