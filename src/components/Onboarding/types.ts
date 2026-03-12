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
};
