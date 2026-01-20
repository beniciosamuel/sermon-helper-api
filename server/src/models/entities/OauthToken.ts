export interface OauthTokenDatabaseEntity {
  id: number;
  user_id: number;
  oauth_token: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface OauthTokenUpdateArgs {
  oauth_token?: string;
}

export interface OauthTokenDeleteArgs {
  id: number;
}

export class OauthToken {
  id: number;
  user_id: number;
  oauth_token: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null = null;

  constructor(args: OauthTokenDatabaseEntity) {
    this.id = args.id;
    this.user_id = args.user_id;
    this.oauth_token = args.oauth_token;
    this.created_at = args.created_at;
    this.updated_at = args.updated_at;
    this.deleted_at = args.deleted_at;
  }
}
