import type { ReactNode } from "react";

import type {
  AuthScreenBackButtonPropsType,
  AuthScreenMotionType,
} from "components";

export type AuthSignUpConfirmationViewPropsType =
  AuthScreenBackButtonPropsType & {
    title: ReactNode;
    description: ReactNode;
    toSignInLabel: ReactNode;
    toSignInAriaLabel?: string;
    resendLabel?: ReactNode;
    resendAriaLabel?: string;
    isResending?: boolean;
    logo?: ReactNode;
    headerExtra?: ReactNode;
    motion?: AuthScreenMotionType;
    onSignIn: () => void;
    onResendConfirmEmail?: () => Promise<void> | void;
  };
