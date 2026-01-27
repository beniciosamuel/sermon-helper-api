import { User, UserCreateArgs } from '../models/entities/User';
import { OauthTokenRepository } from '../models/repositories/OauthTokenRepository';
import { UserRepository } from '../models/repositories/UserRepository';
import { Context } from '../services/Context';

export async function createUser(
  args: UserCreateArgs,
  context: Context
): Promise<{ success: boolean; user?: User; oauthToken?: string; error?: string }> {
  try {
    const existingUser = await UserRepository.findByEmailOrPhone(
      args.email,
      args.phone || '',
      context
    );

    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await UserRepository.create(args, context);

    const oauth = await OauthTokenRepository.create(user.id, context);

    return {
      success: true,
      user,
      oauthToken: oauth.oauth_token,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating user', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
