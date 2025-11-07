module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '!<rootDir>/tests/e2e/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'script.js',
    'game-soundtrack-data.js',
    'sw.js',
    '!node_modules/**',
    '!tests/**',
    '!coverage/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  globals: {
    'window': {},
    'document': {},
    'navigator': {},
    'localStorage': {}
  }
};