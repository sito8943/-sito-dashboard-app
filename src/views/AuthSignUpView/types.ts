import type { ReactNode } from "react";
import type { UseFormSetError } from "react-hook-form";

import type {
  AuthScreenBackButtonPropsType,
  AuthScreenMotionType,
} from "components";

export type AuthSignUpViewFormType = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthSignUpViewErrorContextType = {
  setError: UseFormSetError<AuthSignUpViewFormType>;
};

export type AuthSignUpViewPropsType = AuthScreenBackButtonPropsType & {
  title: ReactNode;
  emailLabel: ReactNode;
  passwordLabel: ReactNode;
  confirmPasswordLabel: ReactNode;
  submitLabel: ReactNode;
  nameLabel?: ReactNode;
  emailRequiredMessage?: string;
  passwordRequiredMessage?: string;
  confirmPasswordRequiredMessage?: string;
  nameRequiredMessage?: string;
  passwordMismatchMessage?: string;
  submitAriaLabel?: string;
  signInQuestion?: ReactNode;
  signInLabel?: ReactNode;
  signInTo?: string;
  guestLabel?: ReactNode;
  guestAriaLabel?: string;
  logo?: ReactNode;
  headerExtra?: ReactNode;
  motion?: AuthScreenMotionType;
  titleClassName?: string;
  className?: string;
  onSubmit: (values: AuthSignUpViewFormType) => Promise<void> | void;
  onStartAsGuest?: () => void;
  onPasswordMismatch?: () => void;
  onError?: (error: unknown, context: AuthSignUpViewErrorContextType) => void;
};
