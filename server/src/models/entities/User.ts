 import { Context } from '../../services/Context';
 
 export interface UserDatabaseEntity {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  color_theme: string;
  lang: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserCreateArgs {
  name: string;
  email: string;
  phone: string;
  password: string;
  color_theme: string;
  language: string;
}

export class User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  color_theme: string;
  lang: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  constructor(args: UserDatabaseEntity) {
    this.id = args.id;
    this.full_name = args.full_name;
    this.email = args.email;
    this.phone = args.phone;
    this.password_hash = args.password_hash;
    this.color_theme = args.color_theme;
    this.lang = args.lang;
    this.created_at = args.created_at;
    this.updated_at = args.updated_at;
    this.deleted_at = args.deleted_at;
  }

  static async create(args: UserCreateArgs): Promise<void> {
    const context = await Context.initialize();

    const user = await context.db?.insert({
      full_name: args.name,
      email: args.email,
      phone: args.phone,
      password_hash: args.password,
      color_theme: args.color_theme,
      lang: args.language,
    }).into('users').returning('*');

    console.log(user);
  }
}
