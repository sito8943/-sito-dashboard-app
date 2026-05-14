type SessionDto<TExtra extends object = Record<string, never>> = {
  id: number;
  username: string;
  email: string;
  token: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
} & TExtra;

export type SessionAccountDto = Partial<SessionDto>;
