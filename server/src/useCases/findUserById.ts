import { User } from '../models/entities/User';
import { UserRepository } from '../models/repositories/UserRepository';
import { Context } from '../services/Context';

export async function findUserById(
  id: number,
  context: Context
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const user = await UserRepository.findById(id, context);

    return {
      success: true,
      user: user || undefined,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error finding user by id', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
