import type { ReactNode } from "react";

import type {
  AuthScreenBackButtonPropsType,
  AuthScreenMotionType,
} from "components";

export type AuthConfirmEmailErrorViewPropsType =
  AuthScreenBackButtonPropsType & {
    title: ReactNode;
    description: ReactNode;
    resendLabel: ReactNode;
    resendAriaLabel?: string;
    toSignInLabel: ReactNode;
    toSignInAriaLabel?: string;
    resendTo: string;
    signInTo: string;
    logo?: ReactNode;
    headerExtra?: ReactNode;
    motion?: AuthScreenMotionType;
  };
