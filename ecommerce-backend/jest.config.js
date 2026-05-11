module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};