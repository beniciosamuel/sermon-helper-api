import fs from 'fs';
import path from 'path';
import { Secrets } from '../../../services/Secrets';

// Mock fs module
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Secrets', () => {
  let secrets: Secrets;

  const mockSecretsData = {
    development: {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'dev_user',
      DB_PASSWORD: 'dev_password',
      DB_NAME: 'dev_database',
      API_KEY: 'dev_api_key',
    },
    production: {
      DB_HOST: 'prod.example.com',
      DB_PORT: '5432',
      DB_USER: 'prod_user',
      DB_PASSWORD: 'prod_password',
      DB_NAME: 'prod_database',
      API_KEY: 'prod_api_key',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    secrets = new Secrets();

    // Default mock: return development secrets
    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSecretsData));
  });

  describe('constructor', () => {
    it('should create a new Secrets instance with development as default env', () => {
      expect(secrets).toBeInstanceOf(Secrets);
    });
  });

  describe('setEnv', () => {
    it('should set environment to production when current env is development', async () => {
      await secrets.setEnv('production');

      // Verify by getting a secret - it should come from production config
      const secret = await secrets.getString('API_KEY');
      expect(secret).toBe('prod_api_key');
    });

    it('should not change environment if already set to production', async () => {
      await secrets.setEnv('production');
      await secrets.setEnv('development'); // This should not change it back

      const secret = await secrets.getString('API_KEY');
      expect(secret).toBe('prod_api_key');
    });

    it('should allow setting to development when already development (no change)', async () => {
      await secrets.setEnv('development');

      const secret = await secrets.getString('API_KEY');
      expect(secret).toBe('dev_api_key');
    });
  });

  describe('getString', () => {
    it('should return the secret value for a valid key in development', async () => {
      const result = await secrets.getString('DB_HOST');

      expect(result).toBe('localhost');
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should return the secret value for a valid key in production', async () => {
      await secrets.setEnv('production');

      const result = await secrets.getString('DB_HOST');

      expect(result).toBe('prod.example.com');
    });

    it('should throw an error when secret key is not found', async () => {
      await expect(secrets.getString('NON_EXISTENT_KEY')).rejects.toThrow(
        'Failed to get secret NON_EXISTENT_KEY'
      );
    });

    it('should throw an error when secrets file cannot be read', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      await expect(secrets.getString('DB_HOST')).rejects.toThrow('Failed to get secret DB_HOST');
    });

    it('should throw an error when secrets file contains invalid JSON', async () => {
      mockFs.readFileSync.mockReturnValue('invalid json content');

      await expect(secrets.getString('DB_HOST')).rejects.toThrow('Failed to get secret DB_HOST');
    });

    it('should throw an error when environment key does not exist in secrets', async () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          staging: { DB_HOST: 'staging.example.com' },
        })
      );

      await expect(secrets.getString('DB_HOST')).rejects.toThrow('Failed to get secret DB_HOST');
    });

    it('should read from correct secrets file path', async () => {
      await secrets.getString('DB_HOST');

      const expectedPath = path.join(process.cwd(), '.env', 'secrets.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith(expectedPath, 'utf8');
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return database configuration from development secrets', async () => {
      const config = await secrets.getDatabaseConfig();

      expect(config).toEqual({
        host: 'localhost',
        port: 5432,
        user: 'dev_user',
        password: 'dev_password',
        database: 'dev_database',
      });
    });

    it('should return database configuration from production secrets', async () => {
      await secrets.setEnv('production');

      const config = await secrets.getDatabaseConfig();

      expect(config).toEqual({
        host: 'prod.example.com',
        port: 5432,
        user: 'prod_user',
        password: 'prod_password',
        database: 'prod_database',
      });
    });

    it('should parse DB_PORT as integer', async () => {
      const config = await secrets.getDatabaseConfig();

      expect(typeof config.port).toBe('number');
      expect(config.port).toBe(5432);
    });

    it('should default to port 5432 when DB_PORT is not set', async () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          development: {
            DB_HOST: 'localhost',
            DB_USER: 'user',
            DB_PASSWORD: 'password',
            DB_NAME: 'database',
            // DB_PORT is missing
          },
        })
      );

      const config = await secrets.getDatabaseConfig();

      expect(config.port).toBe(5432);
    });

    it('should default to port 5432 when DB_PORT is invalid', async () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          development: {
            DB_HOST: 'localhost',
            DB_PORT: 'invalid',
            DB_USER: 'user',
            DB_PASSWORD: 'password',
            DB_NAME: 'database',
          },
        })
      );

      const config = await secrets.getDatabaseConfig();

      expect(config.port).toBe(5432);
    });

    it('should return undefined values when secrets are missing', async () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          development: {},
        })
      );

      const config = await secrets.getDatabaseConfig();

      expect(config.host).toBeUndefined();
      expect(config.user).toBeUndefined();
      expect(config.password).toBeUndefined();
      expect(config.database).toBeUndefined();
      expect(config.port).toBe(5432); // defaults to 5432
    });

    it('should return empty object values when environment does not exist', async () => {
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          staging: { DB_HOST: 'staging.example.com' },
        })
      );

      const config = await secrets.getDatabaseConfig();

      expect(config.host).toBeUndefined();
      expect(config.port).toBe(5432);
    });

    it('should throw an error when file cannot be read', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(secrets.getDatabaseConfig()).rejects.toThrow();
    });
  });
});
