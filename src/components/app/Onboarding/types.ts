import type { ReactNode } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type StepButtonContentPropsType = {
  icon: IconDefinition;
  label: ReactNode;
};

export type OnboardingStepType = {
  title: ReactNode;
  body: ReactNode;
  content?: ReactNode;
  image?: string;
  alt?: string;
  /**
   * Per-step icon overrides. Merged on top of `Onboarding.icons` per action
   * (step wins when both define the same key).
   */
  icons?: OnboardingActionIconsType;
  /**
   * Per-step override. Merged on top of `Onboarding.alwaysShowIcon`. When both
   * are maps, step keys win; when step is a map and onboarding is `boolean`,
   * unspecified step keys inherit the onboarding boolean.
   */
  alwaysShowIcon?: OnboardingActionFlagType;
  /**
   * Per-step override. Same merge semantics as `alwaysShowIcon`.
   */
  alwaysHideLabel?: OnboardingActionFlagType;
  /**
   * Per-step override. Same merge semantics as `alwaysShowIcon`.
   */
  showLabelOnMobile?: OnboardingActionFlagType;
};

export type OnboardingActionKey =
  | "back"
  | "next"
  | "skip"
  | "startAsGuest"
  | "signIn";

export type OnboardingActionIconsType = Partial<
  Record<OnboardingActionKey, IconDefinition>
>;

/**
 * Boolean (applies to every action) or a per-action map. Omitted keys default
 * to `false`.
 */
export type OnboardingActionFlagType =
  | boolean
  | Partial<Record<OnboardingActionKey, boolean>>;

export type StepPropsType = OnboardingStepType & {
  onClickNext: () => void;
  onClickBack?: () => void;
  onSkip: () => void;
  onStartAsGuest: () => void;
  onSignIn: () => void;
  final?: boolean;
  /**
   * Per-action icon overrides. Any omitted entry falls back to the lib default.
   */
  icons?: OnboardingActionIconsType;
  /**
   * Force the action icon visible on desktop. Default mobile shows the icon —
   * this only affects breakpoints >=28rem. Boolean applies to every action;
   * pass a per-action map for granularity (e.g. `{ next: true, back: true }`).
   */
  alwaysShowIcon?: OnboardingActionFlagType;
  /**
   * Force the action label hidden at every breakpoint (icon-only). Boolean
   * applies to every action; pass a per-action map for granularity.
   */
  alwaysHideLabel?: OnboardingActionFlagType;
  /**
   * Render the action label on mobile (<28rem). Default mobile shows icon
   * only. Boolean applies to every action; pass a per-action map for
   * granularity (e.g. `{ startAsGuest: true }` to keep next/back as icons but
   * keep the guest CTA labeled on mobile).
   */
  showLabelOnMobile?: OnboardingActionFlagType;
};

export type OnboardingPropsType = {
  steps: OnboardingStepType[];
  signInPath?: string;
  guestPath?: string;
  onSkip?: () => void;
  onSignIn?: () => void;
  onStartAsGuest?: () => void;
  /**
   * Per-action icon overrides forwarded to each `Step`.
   */
  icons?: OnboardingActionIconsType;
  /**
   * Force the action icon visible on desktop. Boolean or per-action map.
   */
  alwaysShowIcon?: OnboardingActionFlagType;
  /**
   * Force the action label hidden at every breakpoint. Boolean or per-action
   * map.
   */
  alwaysHideLabel?: OnboardingActionFlagType;
  /**
   * Render the action label on mobile (default mobile shows icon only).
   * Boolean or per-action map.
   */
  showLabelOnMobile?: OnboardingActionFlagType;
  /**
   * When `true`, the active step panel is remounted on every step change so
   * CSS entry animations (e.g. `big-appear` on the step container) restart.
   * Defaults to `false` to preserve existing reconciliation behavior — opt in
   * when consumers want each step to animate in from scratch.
   */
  remountStepOnChange?: boolean;
};
