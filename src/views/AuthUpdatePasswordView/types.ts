import type { ReactNode } from "react";

import type { IAuthApiClient } from "lib";
import type {
  AuthScreenBackButtonPropsType,
  AuthScreenMotionType,
} from "components";

export type AuthUpdatePasswordViewPropsType = AuthScreenBackButtonPropsType & {
  authApi: IAuthApiClient;
  title: ReactNode;
  passwordLabel: ReactNode;
  confirmPasswordLabel: ReactNode;
  submitLabel: ReactNode;
  submitAriaLabel?: string;
  passwordRequiredMessage?: string;
  confirmPasswordRequiredMessage?: string;
  passwordMismatchMessage?: string;
  signInQuestion?: ReactNode;
  signInLabel?: ReactNode;
  signInTo?: string;
  logo?: ReactNode;
  headerExtra?: ReactNode;
  motion?: AuthScreenMotionType;
  successRedirectDelayMs?: number;
  onSuccess?: () => void;
  onInvalidToken?: () => void;
  onError?: (error: unknown) => void;
  onPasswordMismatch?: () => void;
};
