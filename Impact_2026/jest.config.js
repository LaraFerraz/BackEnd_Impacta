module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/models/index.js',
    '!src/config/**',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
  verbose: true
};
