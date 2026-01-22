import { Context } from '../../services/Context';
import { OauthToken } from '../entities/OauthToken';
import crypto from 'crypto';

export class OauthTokenRepository extends OauthToken {
  static async generateToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  static async create(user_id: number, context: Context): Promise<OauthTokenRepository> {
    const oauthToken = await context.db
      .insert({
        user_id,
        oauth_token: await this.generateToken(),
      })
      .into('oauth_token')
      .returning('*');

    return new OauthTokenRepository(oauthToken[0]);
  }

  async regenerate(context: Context): Promise<boolean> {
    const newToken = await OauthTokenRepository.generateToken();
    const updated = await context
      .db('oauth_token')
      .where('id', this.id)
      .update({
        oauth_token: newToken,
        updated_at: new Date().toISOString(),
      });

    // Update the instance's oauth_token property
    if (updated > 0) {
      this.oauth_token = newToken;
    }

    return updated > 0;
  }

  async revoke(context: Context): Promise<boolean> {
    const deleted = await context
      .db('oauth_token')
      .where('id', this.id)
      .whereNull('deleted_at')
      .update({
        deleted_at: new Date().toISOString(),
      });

    return deleted > 0;
  }

  static async findById(id: number, context: Context): Promise<OauthTokenRepository | null> {
    const oauthToken = await context
      .db('oauth_token')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
    return oauthToken ? new OauthTokenRepository(oauthToken) : null;
  }

  static async findByUserId(
    userId: number,
    context: Context
  ): Promise<OauthTokenRepository | null> {
    const oauthToken = await context
      .db('oauth_token')
      .where('user_id', userId)
      .whereNull('deleted_at')
      .first();
    return oauthToken ? new OauthTokenRepository(oauthToken) : null;
  }

  static async findByOauthToken(
    oauthToken: string,
    context: Context
  ): Promise<OauthTokenRepository | null> {
    const token = await context
      .db('oauth_token')
      .where('oauth_token', oauthToken)
      .whereNull('deleted_at')
      .first();
    return token ? new OauthTokenRepository(token) : null;
  }
}
