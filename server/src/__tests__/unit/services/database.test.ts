import { DatabaseService, DatabaseConnectionError } from '../../../services/Database';
import { Secrets } from '../../../services/Secrets';

// Create mock knex instance
const mockKnexInstance = {
	raw: jest.fn(),
	destroy: jest.fn(),
};

// Mock knex module - store config for assertions
let lastKnexConfig: unknown = null;
jest.mock('knex', () => ({
	__esModule: true,
	default: (config: unknown) => {
		lastKnexConfig = config;
		return mockKnexInstance;
	},
}));

// Mock Secrets module
jest.mock('../../../services/Secrets');

describe('DatabaseService', () => {
	const mockDatabaseConfig = {
		host: 'localhost',
		port: 5432,
		user: 'test_user',
		password: 'test_password',
		database: 'test_database',
	};

	beforeEach(() => {
		jest.clearAllMocks();
		
		// Reset the singleton instance for each test
		// @ts-expect-error - Accessing private static property for testing
		DatabaseService.instance = undefined;

		// Reset knex mock
		lastKnexConfig = null;
		mockKnexInstance.raw.mockReset();
		mockKnexInstance.destroy.mockReset();
		
		// Default: successful connection test
		mockKnexInstance.raw.mockResolvedValue([{ '?column?': 1 }]);
		mockKnexInstance.destroy.mockResolvedValue(undefined);

		// Mock Secrets.getDatabaseConfig
		const MockSecrets = Secrets as jest.MockedClass<typeof Secrets>;
		MockSecrets.prototype.getDatabaseConfig.mockResolvedValue(mockDatabaseConfig);
	});

	describe('getInstance', () => {
		it('should return the same instance (singleton pattern)', () => {
			const instance1 = DatabaseService.getInstance();
			const instance2 = DatabaseService.getInstance();

			expect(instance1).toBe(instance2);
		});

		it('should create a new instance if none exists', () => {
			const instance = DatabaseService.getInstance();

			expect(instance).toBeInstanceOf(DatabaseService);
		});
	});

	describe('connect', () => {
		it('should connect to the database successfully', async () => {
			const service = DatabaseService.getInstance();

			const result = await service.connect();

			expect(result).toBeDefined();
			expect(mockKnexInstance.raw).toHaveBeenCalledWith('SELECT 1');
		});

		it('should return existing connection if already connected', async () => {
			const service = DatabaseService.getInstance();

			const firstConnection = await service.connect();
			const secondConnection = await service.connect();

			expect(firstConnection).toBe(secondConnection);
			// raw should only be called once for the initial connection test
			expect(mockKnexInstance.raw).toHaveBeenCalledTimes(1);
		});

		it('should create knex instance with correct configuration', async () => {
			const service = DatabaseService.getInstance();

			await service.connect();

			expect(lastKnexConfig).toMatchObject({
				client: 'pg',
				connection: {
					host: 'localhost',
					port: 5432,
					user: 'test_user',
					password: 'test_password',
					database: 'test_database',
				},
			});
		});

		it('should include pool configuration', async () => {
			const service = DatabaseService.getInstance();

			await service.connect();

			expect(lastKnexConfig).toMatchObject({
				pool: {
					min: 2,
					max: 10,
				},
			});
		});

		it('should throw DatabaseConnectionError when host is missing', async () => {
			const MockSecrets = Secrets as jest.MockedClass<typeof Secrets>;
			MockSecrets.prototype.getDatabaseConfig.mockResolvedValue({
				...mockDatabaseConfig,
				host: '',
			});

			const service = DatabaseService.getInstance();

			await expect(service.connect()).rejects.toThrow(DatabaseConnectionError);
			await expect(service.connect()).rejects.toThrow(
				'Missing required database configuration'
			);
		});

		it('should throw DatabaseConnectionError when user is missing', async () => {
			const MockSecrets = Secrets as jest.MockedClass<typeof Secrets>;
			MockSecrets.prototype.getDatabaseConfig.mockResolvedValue({
				...mockDatabaseConfig,
				user: '',
			});

			const service = DatabaseService.getInstance();

			await expect(service.connect()).rejects.toThrow(DatabaseConnectionError);
		});

		it('should throw DatabaseConnectionError when database is missing', async () => {
			const MockSecrets = Secrets as jest.MockedClass<typeof Secrets>;
			MockSecrets.prototype.getDatabaseConfig.mockResolvedValue({
				...mockDatabaseConfig,
				database: '',
			});

			const service = DatabaseService.getInstance();

			await expect(service.connect()).rejects.toThrow(DatabaseConnectionError);
		});

		it('should throw DatabaseConnectionError when connection test fails', async () => {
			mockKnexInstance.raw.mockRejectedValue(new Error('Connection refused'));

			const service = DatabaseService.getInstance();

			await expect(service.connect()).rejects.toThrow(DatabaseConnectionError);
			await expect(service.connect()).rejects.toThrow(
				'Failed to connect to the database'
			);
		});

		it('should preserve original error as cause when connection fails', async () => {
			const originalError = new Error('ECONNREFUSED');
			mockKnexInstance.raw.mockRejectedValue(originalError);

			const service = DatabaseService.getInstance();

			try {
				await service.connect();
				fail('Expected error to be thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(DatabaseConnectionError);
				expect((error as DatabaseConnectionError).cause).toBe(originalError);
			}
		});

		it('should re-throw DatabaseConnectionError without wrapping', async () => {
			const MockSecrets = Secrets as jest.MockedClass<typeof Secrets>;
			MockSecrets.prototype.getDatabaseConfig.mockResolvedValue({
				host: '',
				port: 5432,
				user: '',
				database: '',
				password: '',
			});

			const service = DatabaseService.getInstance();

			try {
				await service.connect();
				fail('Expected error to be thrown');
			} catch (error) {
				expect(error).toBeInstanceOf(DatabaseConnectionError);
				expect((error as DatabaseConnectionError).cause).toBeUndefined();
			}
		});

		it('should handle non-Error objects thrown during connection', async () => {
			mockKnexInstance.raw.mockRejectedValue('String error');

			const service = DatabaseService.getInstance();

			await expect(service.connect()).rejects.toThrow(DatabaseConnectionError);
		});
	});

	describe('getKnex', () => {
		it('should return knex instance when connected', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();

			const knexInstance = service.getKnex();

			expect(knexInstance).toBeDefined();
		});

		it('should throw DatabaseConnectionError when not connected', () => {
			const service = DatabaseService.getInstance();

			expect(() => service.getKnex()).toThrow(DatabaseConnectionError);
			expect(() => service.getKnex()).toThrow(
				'Database not connected. Call connect() first.'
			);
		});
	});

	describe('isReady', () => {
		it('should return false before connecting', () => {
			const service = DatabaseService.getInstance();

			expect(service.isReady()).toBe(false);
		});

		it('should return true after successful connection', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();

			expect(service.isReady()).toBe(true);
		});

		it('should return false after disconnecting', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();
			await service.disconnect();

			expect(service.isReady()).toBe(false);
		});
	});

	describe('disconnect', () => {
		it('should destroy knex connection when connected', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();

			await service.disconnect();

			expect(mockKnexInstance.destroy).toHaveBeenCalled();
		});

		it('should set isConnected to false after disconnect', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();
			expect(service.isReady()).toBe(true);

			await service.disconnect();

			expect(service.isReady()).toBe(false);
		});

		it('should not throw when disconnecting without connection', async () => {
			const service = DatabaseService.getInstance();

			await expect(service.disconnect()).resolves.not.toThrow();
		});

		it('should allow reconnecting after disconnect', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();
			await service.disconnect();

			const connection = await service.connect();

			expect(connection).toBeDefined();
			expect(service.isReady()).toBe(true);
		});
	});

	describe('healthCheck', () => {
		it('should return true when database is accessible', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();

			const result = await service.healthCheck();

			expect(result).toBe(true);
			expect(mockKnexInstance.raw).toHaveBeenCalledWith('SELECT 1');
		});

		it('should return false when not connected', async () => {
			const service = DatabaseService.getInstance();

			const result = await service.healthCheck();

			expect(result).toBe(false);
		});

		it('should return false when database query fails', async () => {
			const service = DatabaseService.getInstance();
			await service.connect();
			
			// Reset and make the next raw call fail
			mockKnexInstance.raw.mockRejectedValueOnce(new Error('Connection lost'));

			const result = await service.healthCheck();

			expect(result).toBe(false);
		});
	});

	describe('DatabaseConnectionError', () => {
		it('should create error with message', () => {
			const error = new DatabaseConnectionError('Test error');

			expect(error.message).toBe('Test error');
			expect(error.name).toBe('DatabaseConnectionError');
		});

		it('should create error with cause', () => {
			const cause = new Error('Original error');
			const error = new DatabaseConnectionError('Test error', cause);

			expect(error.message).toBe('Test error');
			expect(error.cause).toBe(cause);
		});

		it('should be instance of Error', () => {
			const error = new DatabaseConnectionError('Test error');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(DatabaseConnectionError);
		});
	});
});
