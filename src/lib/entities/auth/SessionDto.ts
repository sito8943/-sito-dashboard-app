// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type SessionDto<TExtra extends object = {}> = {
  id: number;
  username: string;
  email: string;
  token: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
} & TExtra;

export type SessionAccountDto = Partial<SessionDto>;
