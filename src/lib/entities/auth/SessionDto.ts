export type SessionDto<TExtra extends object = Record<string, unknown>> = {
  id: number;
  username: string;
  email: string;
  token: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
} & TExtra;

export type SessionAccountDto<TExtra extends object = Record<string, unknown>> =
  Partial<SessionDto<TExtra>>;
