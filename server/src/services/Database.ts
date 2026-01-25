import knex, { Knex } from 'knex';
import { Secrets } from './Secrets';

/**
 * Database configuration interface
 * Use either connectionString (e.g. Neon DATABASE_URL) or individual params.
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  /** When set (e.g. Neon), used as the connection; must include SSL if required. */
  connectionString?: string;
}

/**
 * Database connection error
 */
export class DatabaseConnectionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
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
  private isConnected = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
   * Create Knex configuration from database config.
   * When connectionString is set (e.g. Neon DATABASE_URL), uses it with SSL.
   * Otherwise uses host/port/user/password/database; enables SSL for non-localhost.
   */
  private createKnexConfig(config: DatabaseConfig): Knex.Config {
    const useSsl =
      !!config.connectionString ||
      (config.host && !['localhost', '127.0.0.1'].includes(config.host));

    const connection: Knex.PgConnectionConfig = config.connectionString
      ? {
          connectionString: config.connectionString,
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        }
      : {
          host: config.host,
          port: config.port,
          user: config.user,
          password: config.password,
          database: config.database,
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        };

    return {
      client: 'pg',
      connection,
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 20000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
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

      const hasConnectionString = !!config.connectionString?.trim();
      const hasIndividual = !!(
        config.host?.trim() &&
        config.user?.trim() &&
        config.database?.trim()
      );

      if (!hasConnectionString && !hasIndividual) {
        throw new DatabaseConnectionError(
          'Missing database config. Set DATABASE_URL (e.g. Neon) or DB_HOST, DB_USER, DB_NAME.'
        );
      }

      const knexConfig = this.createKnexConfig(config);
      this.knexInstance = knex(knexConfig);

      await this.knexInstance.raw('SELECT 1');
      this.isConnected = true;

      // eslint-disable-next-line no-console
      console.log(
        hasConnectionString
          ? `Database connected successfully (connection string)`
          : `Database connected successfully to ${config.host}:${config.port}/${config.database}`
      );

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
      throw new DatabaseConnectionError('Database not connected. Call connect() first.');
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
      // eslint-disable-next-line no-console
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
