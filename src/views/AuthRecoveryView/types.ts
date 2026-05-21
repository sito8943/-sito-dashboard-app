import type { ReactNode } from "react";
import type { UseFormSetError } from "react-hook-form";

import type { AuthScreenMotionType } from "components";
import type { RecoveryFormType } from "lib";

export type AuthRecoveryViewActionType = "submit" | "secondary";

export type AuthRecoveryViewErrorContextType = {
  action: AuthRecoveryViewActionType;
  setError: UseFormSetError<RecoveryFormType>;
};

export type AuthRecoveryViewPropsType = {
  title: ReactNode;
  emailLabel: ReactNode;
  submitLabel: ReactNode;
  description?: ReactNode;
  statusMessage?: ReactNode;
  emailRequiredMessage?: string;
  submitAriaLabel?: string;
  signInQuestion?: ReactNode;
  signInLabel?: ReactNode;
  signInTo?: string;
  secondaryActionLabel?: ReactNode;
  secondaryActionAriaLabel?: string;
  logo?: ReactNode;
  headerExtra?: ReactNode;
  motion?: AuthScreenMotionType;
  titleClassName?: string;
  className?: string;
  onSubmit: (values: RecoveryFormType) => Promise<void> | void;
  onSecondaryAction?: (values: RecoveryFormType) => Promise<void> | void;
  onError?: (error: unknown, context: AuthRecoveryViewErrorContextType) => void;
};
