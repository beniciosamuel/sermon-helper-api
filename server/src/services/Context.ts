import { EmailService } from "./Email";
import { Secrets } from "./Secrets";
import { DatabaseService } from "./Database";
import { Knex } from "knex";

export class Context {
  public db: Knex | null = null;
  public email: EmailService | null = null;
  public secrets: Secrets;

  constructor(args: {
    db: Knex;
    email: EmailService;
    secrets: Secrets;
  }) {
    this.db = args.db;
    this.email = args.email || null;
    this.secrets = args.secrets || new Secrets();
  }

  static async initialize(): Promise<Context> {
    const db = DatabaseService.getInstance();
    const email = await EmailService.initialize();
    const secrets = new Secrets();

    return new Context({ db: await db.connect(), email, secrets });
  }
}
