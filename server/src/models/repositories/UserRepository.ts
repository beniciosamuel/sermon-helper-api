import { Context } from '../../services/Context';
import { User, UserCreateArgs, UserUpdateArgs } from '../entities/User';

export class UserRepository extends User {
  static async create(args: UserCreateArgs, context: Context): Promise<User> {
    const passwordHash = await context.password.encrypt(args.password);

    const user = await context.db
      .insert({
        full_name: args.name,
        email: args.email,
        phone: args.phone || null,
        password_hash: passwordHash,
        color_theme: args.color_theme,
        lang: args.language,
      })
      .into('users')
      .returning('*');

    return new User(user[0]);
  }

  async update(args: UserUpdateArgs, context: Context): Promise<boolean> {
    const updated = await context
      .db('users')
      .where('id', this.id)
      .whereNull('deleted_at')
      .update({
        ...args,
        password_hash: args.password
          ? await context.password.encrypt(args.password)
          : this.password_hash,
        updated_at: new Date().toISOString(),
      });

    return updated > 0;
  }

  async delete(context: Context): Promise<boolean> {
    const deleted = await context.db('users').where('id', this.id).update({
      deleted_at: new Date().toISOString(),
    });

    return deleted > 0;
  }

  static async findById(id: number, context: Context): Promise<User | null> {
    const user = await context.db('users').where('id', id).whereNull('deleted_at').first();

    return user ? new User(user) : null;
  }

  static async findByEmailOrPhone(
    email: string,
    phone: string,
    context: Context
  ): Promise<User | null> {
    const user = await context
      .db('users')
      .where('email', email)
      .orWhere('phone', phone)
      .whereNull('deleted_at')
      .first();

    return user ? new User(user) : null;
  }
}
