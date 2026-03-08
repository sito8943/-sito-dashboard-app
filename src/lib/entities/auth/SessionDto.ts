export type SessionDto = {
  id: number;
  username: string;
  email: string;
  token: string;
  refreshToken?: string | null;
  accessTokenExpiresAt?: string | null;
};
