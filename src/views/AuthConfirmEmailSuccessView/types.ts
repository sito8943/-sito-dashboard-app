import type { ReactNode } from "react";

import type { IAuthApiClient } from "lib";
import type { AuthScreenMotionType } from "components";

export type AuthConfirmEmailSuccessViewPropsType = {
  authApi: IAuthApiClient;
  title: ReactNode;
  description: ReactNode;
  toSignInLabel: ReactNode;
  toSignInAriaLabel?: string;
  signInTo: string;
  errorTo: string;
  successTo?: string;
  logo?: ReactNode;
  headerExtra?: ReactNode;
  motion?: AuthScreenMotionType;
  verifyingLabel?: ReactNode;
  onSuccess?: () => void;
  onInvalidToken?: () => void;
  onError?: (error: unknown) => void;
  onCleanUrl?: () => void;
};
