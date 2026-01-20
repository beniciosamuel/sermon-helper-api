import { EmailService } from './Email';
import { Secrets } from './Secrets';
import { DatabaseService } from './Database';
import { Password } from './Password';
import { Knex } from 'knex';
import { User } from '../models/entities/User';

export class Context {
  public db: Knex;
  public email: EmailService | null = null;
  public secrets: Secrets;
  public password: Password;
  public user: User | null = null;

  constructor(args: {
    db: Knex;
    email: EmailService;
    secrets: Secrets;
    password: Password;
    user?: User;
  }) {
    this.db = args.db;
    this.email = args.email || null;
    this.secrets = args.secrets || new Secrets();
    this.password = args.password || new Password();
    this.user = args.user || null;
  }

  static async initialize(): Promise<Context> {
    const db = DatabaseService.getInstance();
    const email = await EmailService.initialize();
    const secrets = new Secrets();
    const password = new Password();

    return new Context({ db: await db.connect(), email, secrets, password });
  }
}
