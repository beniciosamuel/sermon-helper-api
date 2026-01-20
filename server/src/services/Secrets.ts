import fs from 'fs';
import path from 'path';

const SECRETS_DIR = path.join(process.cwd(), '.env');

export class Secrets {
  private env: 'development' | 'production' = 'development';

  async setEnv(env: 'development' | 'production'): Promise<void> {
    if (this.env === 'development') {
      this.env = env;
    }
  }

  private async getSecrets(): Promise<Record<string, Record<string, string>>> {
    const secretsPath = path.join(SECRETS_DIR, 'secrets.json');
    return JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
  }

  private async getEnvSecrets(): Promise<Record<string, string>> {
    const secrets = await this.getSecrets();
    return secrets[this.env] || {};
  }

  async getString(key: string): Promise<string> {
    try {
      const secrets = await this.getSecrets();
      const secret = secrets[this.env][key];
      if (!secret) {
        throw new Error(`Secret ${key} not found`);
      }
      return secret;
    } catch (error) {
      throw new Error(`Failed to get secret ${key}: ${error}`);
    }
  }

  async getDatabaseConfig(): Promise<{
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  }> {
    const secrets = await this.getEnvSecrets();

    return {
      host: secrets.DB_HOST,
      port: parseInt(secrets.DB_PORT) || 5432,
      user: secrets.DB_USER,
      password: secrets.DB_PASSWORD,
      database: secrets.DB_NAME,
    };
  }

  async getResendApiKey(): Promise<string> {
    return this.getString('RESEND_API_KEY');
  }
}
