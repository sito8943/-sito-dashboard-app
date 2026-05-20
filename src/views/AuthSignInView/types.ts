import type { ReactNode } from "react";
import type { UseFormSetError } from "react-hook-form";

import type { AuthScreenMotionType } from "components";
import type { AuthDto } from "lib";

export type AuthSignInViewFormType = AuthDto<{
  rememberMe: boolean;
}>;

export type AuthSignInViewErrorContextType = {
  setError: UseFormSetError<AuthSignInViewFormType>;
};

export type AuthSignInViewPropsType = {
  title: ReactNode;
  emailLabel: ReactNode;
  passwordLabel: ReactNode;
  submitLabel: ReactNode;
  emailRequiredMessage?: string;
  passwordRequiredMessage?: string;
  rememberLabel?: ReactNode;
  submitAriaLabel?: string;
  signUpQuestion?: ReactNode;
  signUpLabel?: ReactNode;
  signUpTo?: string;
  recoveryQuestion?: ReactNode;
  recoveryLabel?: ReactNode;
  recoveryTo?: string;
  guestLabel?: ReactNode;
  guestAriaLabel?: string;
  logo?: ReactNode;
  headerExtra?: ReactNode;
  motion?: AuthScreenMotionType;
  titleClassName?: string;
  className?: string;
  onSubmit: (values: AuthSignInViewFormType) => Promise<void> | void;
  onStartAsGuest?: () => void;
  onError?: (error: unknown, context: AuthSignInViewErrorContextType) => void;
};
