import knex, { Knex } from 'knex';
import { Secrets } from './Secrets';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends Error {
	constructor(message: string, public readonly cause?: Error) {
		super(message);
		this.name = 'DatabaseConnectionError';
	}
}

/**
 * Database service for managing PostgreSQL connections using Knex.js
 */
export class DatabaseService {
	private static instance: DatabaseService;
	private knexInstance: Knex | null = null;
	private isConnected: boolean = false;

	private constructor() {}

	/**
	 * Get the singleton instance of DatabaseService
	 */
	public static getInstance(): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService();
		}
		return DatabaseService.instance;
	}

	/**
	 * Get database configuration from environment variables or secrets
	 */
	private async getConfig(): Promise<DatabaseConfig> {
		const secrets = new Secrets();
		return secrets.getDatabaseConfig();
	}

	/**
	 * Create Knex configuration from database config
	 */
	private createKnexConfig(config: DatabaseConfig): Knex.Config {
		console.log(config);
		return {
			client: 'pg',
			connection: {
				host: config.host,
				port: config.port,
				user: config.user,
				password: config.password,
				database: config.database,
			},
			pool: {
				min: 2,
				max: 10,
				acquireTimeoutMillis: 30000,
				createTimeoutMillis: 30000,
				destroyTimeoutMillis: 5000,
				idleTimeoutMillis: 30000,
				reapIntervalMillis: 1000,
				createRetryIntervalMillis: 100,
			},
			acquireConnectionTimeout: 10000,
		};
	}

	/**
	 * Initialize the database connection
	 * @throws {DatabaseConnectionError} If connection fails
	 */
	public async connect(): Promise<Knex> {
		if (this.knexInstance && this.isConnected) {
			return this.knexInstance;
		}

		try {
			const config = await this.getConfig();
			
			// Validate configuration
			if (!config.host || !config.user || !config.database) {
				throw new DatabaseConnectionError(
					'Missing required database configuration. Please ensure DB_HOST, DB_USER, and DB_NAME are set.'
				);
			}

			const knexConfig = this.createKnexConfig(config);
			this.knexInstance = knex(knexConfig);

			// Test the connection getting all tables
			const tables = await this.knexInstance.raw('SELECT 1');
			console.log(tables);
			this.isConnected = true;

			console.log(`Database connected successfully to ${config.host}:${config.port}/${config.database}`);
			
			return this.knexInstance;
		} catch (error) {
			this.isConnected = false;
			this.knexInstance = null;

			if (error instanceof DatabaseConnectionError) {
				throw error;
			}

			throw new DatabaseConnectionError(
				'Failed to connect to the database',
				error instanceof Error ? error : new Error(String(error))
			);
		}
	}

	/**
	 * Get the Knex instance (must call connect() first)
	 * @throws {DatabaseConnectionError} If not connected
	 */
	public getKnex(): Knex {
		if (!this.knexInstance || !this.isConnected) {
			throw new DatabaseConnectionError(
				'Database not connected. Call connect() first.'
			);
		}
		return this.knexInstance;
	}

	/**
	 * Check if the database is connected
	 */
	public isReady(): boolean {
		return this.isConnected && this.knexInstance !== null;
	}

	/**
	 * Close the database connection
	 */
	public async disconnect(): Promise<void> {
		if (this.knexInstance) {
			await this.knexInstance.destroy();
			this.knexInstance = null;
			this.isConnected = false;
			console.log('Database connection closed');
		}
	}

	/**
	 * Health check for the database connection
	 * @returns true if database is accessible, false otherwise
	 */
	public async healthCheck(): Promise<boolean> {
		if (!this.knexInstance) {
			return false;
		}

		try {
			await this.knexInstance.raw('SELECT 1');
			return true;
		} catch {
			return false;
		}
	}
}
