module.exports = {
  verbose: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleDirectories: ['src', 'node_modules'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest/framework-setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
  },
  transformIgnorePatterns: [
    '/node_modules\/(?!@playson-dev)(.*)',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleNameMapper: {
    '@components(.*)$': '<rootDir>/src/components/$1',
    '@ebs(.*)$': '<rootDir>/src/event-bus/$1',
    '@fixtures(.*)$': '<rootDir>/src/__fixture__/$1',
  },
};
