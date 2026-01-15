/**
 * Global test setup file
 * This file runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SERVER_PORT = '3000';

// Mock console methods to reduce noise in test output (optional)
// Uncomment if you want to silence console logs during tests
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test timeout (optional, default is 5000ms)
jest.setTimeout(10000);

// Cleanup after all tests
afterAll(async () => {
	// Add any global cleanup logic here
	// e.g., close database connections, clear caches, etc.
});
