const SECRETS_PATH = '/.env/secrets.json';

export class Secrets {
  private env: 'development' | 'production';
  private secretsCache: Record<string, Record<string, string>> | null = null;

  constructor() {
    this.env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }

  setEnv(env: 'development' | 'production'): void {
    if (this.env === 'development') {
      this.env = env;
    }
  }

  private async getSecrets(): Promise<Record<string, Record<string, string>>> {
    if (this.secretsCache) {
      return this.secretsCache;
    }

    try {
      const response = await fetch(SECRETS_PATH);
      if (!response.ok) {
        throw new Error(`Failed to fetch secrets: ${response.statusText}`);
      }
      this.secretsCache = await response.json();
      return this.secretsCache!;
    } catch (error) {
      throw new Error(`Failed to load secrets: ${error}`);
    }
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

  async getApiUrl(): Promise<string> {
    try {
      return await this.getString('API_URL');
    } catch {
      return 'http://localhost:3000';
    }
  }

  async getWsUrl(): Promise<string> {
    try {
      return await this.getString('WS_URL');
    } catch {
      return 'http://localhost:3000';
    }
  }

  async getTrpcUrl(): Promise<string> {
    const apiUrl = await this.getApiUrl();
    return `${apiUrl}/v1/trpc`;
  }

  getEnv(): 'development' | 'production' {
    return this.env;
  }

  isDevelopment(): boolean {
    return this.env === 'development';
  }

  isProduction(): boolean {
    return this.env === 'production';
  }
}

export const secrets = new Secrets();
