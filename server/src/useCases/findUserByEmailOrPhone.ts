import { User } from "../models/entities/User";
import { UserRepository } from "../models/repositories/UserRepository";
import { Context } from "../services/Context";

export async function findUserByEmailOrPhone(email: string, phone: string, context: Context): 
Promise<{ success: boolean, user?: User, error?: string }> {
  try {
    const user = await UserRepository.findByEmailOrPhone(email, phone, context);

    return {
      success: true,
      user: user || undefined,
    }
  } catch (error) {
    console.error('Error finding user by email or phone', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
