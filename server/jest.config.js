'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const config = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',
  // Test environment
  testEnvironment: 'node',
  // Root directory for tests
  roots: ['<rootDir>/src'],
  // Test file patterns
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  // Files to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.dist/',
    '/coverage/',
    '/__tests__/setup.ts',
    '/__tests__/utils/',
  ],
  // Transform files with ts-jest
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          // Use the same tsconfig as the project
          esModuleInterop: true,
          module: 'commonjs',
          target: 'es2016',
          strict: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts', // Exclude entry point if desired
  ],
  // Coverage thresholds (adjust as needed)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  // Coverage directory
  coverageDirectory: 'coverage',
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true,
  // Reset mocks between tests
  resetMocks: true,
  // Verbose output
  verbose: true,
  // Module name mapper for path aliases (if you use them)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
exports.default = config;
