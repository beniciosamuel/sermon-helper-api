import { User } from '../models/entities/User';
import { OauthTokenRepository } from '../models/repositories/OauthTokenRepository';
import { UserRepository } from '../models/repositories/UserRepository';
import { Context } from '../services/Context';

export async function authenticate({
  email,
  phone,
  password,
  context,
}: {
  email: string;
  phone: string;
  password: string;
  context: Context;
}): Promise<{ success: boolean; user?: User; oauthToken?: string; error?: string }> {
  try {
    const user = await UserRepository.findByEmailOrPhone(email, phone, context);

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await context.password.verify(user.password_hash, password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    let oauthToken = await OauthTokenRepository.findByUserId(user.id, context);

    if (oauthToken) {
      await oauthToken.regenerate(context);
    } else {
      oauthToken = await OauthTokenRepository.create(user.id, context);
    }

    return {
      success: true,
      user,
      oauthToken: oauthToken.oauth_token,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error authenticating user', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
