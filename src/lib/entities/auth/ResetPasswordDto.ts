export type ResetPasswordByAccessTokenDto = {
  accessToken: string;
  refreshToken?: string;
  newPassword: string;
};

export type ResetPasswordByTokenHashDto = {
  tokenHash: string;
  type: string;
  newPassword: string;
  refreshToken?: string;
};

export type ResetPasswordDto =
  ResetPasswordByAccessTokenDto | ResetPasswordByTokenHashDto;
