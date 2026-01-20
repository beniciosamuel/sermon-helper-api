/**
 * Common mocks for external dependencies
 * Centralized place for mocking external services, databases, etc.
 */

/**
 * Mock Google Cloud Secret Manager
 */
export const mockSecretManager = {
  getSecret: jest.fn(),
  createSecret: jest.fn(),
  deleteSecret: jest.fn(),
  accessSecretVersion: jest.fn(),
};

/**
 * Mock database connection
 */
export const mockDatabase = {
  query: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  transaction: jest.fn(),
};

/**
 * Mock Socket.IO
 */
export const mockSocketIO = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockSecretManager.getSecret.mockReset();
  mockSecretManager.createSecret.mockReset();
  mockSecretManager.deleteSecret.mockReset();
  mockSecretManager.accessSecretVersion.mockReset();
  mockDatabase.query.mockReset();
  mockDatabase.connect.mockReset();
  mockDatabase.disconnect.mockReset();
  mockDatabase.transaction.mockReset();
  mockSocketIO.on.mockReset();
  mockSocketIO.emit.mockReset();
  mockSocketIO.disconnect.mockReset();
};
