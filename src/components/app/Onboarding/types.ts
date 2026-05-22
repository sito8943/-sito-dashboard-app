import type { ReactNode } from "react";

export type OnboardingStepType = {
  title: ReactNode;
  body: ReactNode;
  content?: ReactNode;
  image?: string;
  alt?: string;
};

export type StepPropsType = OnboardingStepType & {
  onClickNext: () => void;
  onSkip: () => void;
  onStartAsGuest: () => void;
  onSignIn: () => void;
  final?: boolean;
};

export type OnboardingPropsType = {
  steps: OnboardingStepType[];
  signInPath?: string;
  guestPath?: string;
  onSkip?: () => void;
  onSignIn?: () => void;
  onStartAsGuest?: () => void;
  /**
   * When `true`, the active step panel is remounted on every step change so
   * CSS entry animations (e.g. `big-appear` on the step container) restart.
   * Defaults to `false` to preserve existing reconciliation behavior — opt in
   * when consumers want each step to animate in from scratch.
   */
  remountStepOnChange?: boolean;
};
