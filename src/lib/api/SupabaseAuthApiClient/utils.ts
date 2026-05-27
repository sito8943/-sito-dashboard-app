import type { ConfirmEmailDto, ResetPasswordDto } from "../../entities";

import { RESET_PASSWORD_REFRESH_TOKEN_REQUIRED_ERROR } from "./constants";

export const trimOrUndefined = (
  value: string | undefined,
): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const toOtpPayload = (data: ConfirmEmailDto) => ({
  token_hash: data.tokenHash,
  type: data.type,
});

export const requireRefreshToken = (data: ResetPasswordDto): string => {
  if (data.refreshToken) return data.refreshToken;
  throw new Error(RESET_PASSWORD_REFRESH_TOKEN_REQUIRED_ERROR);
};
