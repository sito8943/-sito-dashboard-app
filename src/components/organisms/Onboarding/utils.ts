import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// types
import {
  OnboardingActionFlagType,
  OnboardingActionIconsType,
  OnboardingActionKey,
} from "./types";

// constants
import { DEFAULT_ONBOARDING_ICONS, ONBOARDING_ACTION_KEYS } from "./constants";

/**
 * Resolves a boolean or per-action flag map into a concrete boolean for a
 * single action key.
 */
export const resolveOnboardingFlag = (
  flag: OnboardingActionFlagType | undefined,
  action: OnboardingActionKey,
): boolean => {
  if (!flag) return false;
  if (typeof flag === "boolean") return flag;
  return Boolean(flag[action]);
};

/**
 * Merges a per-step icon override on top of the onboarding-level icon map.
 * Step keys win when both define the same action.
 */
export const mergeOnboardingIcons = (
  base: OnboardingActionIconsType | undefined,
  override: OnboardingActionIconsType | undefined,
): OnboardingActionIconsType | undefined => {
  if (!override) return base;
  if (!base) return override;
  return { ...base, ...override };
};

/**
 * Merges a per-step flag override on top of the onboarding-level flag.
 *
 * Semantics:
 * - `override === undefined` -> inherit `base`.
 * - `override === boolean`   -> replaces `base` outright.
 * - `override === map` + `base === map`     -> shallow merge, override wins.
 * - `override === map` + `base === boolean` -> expand `base` into a full map,
 *   then override wins per key.
 */
export const mergeOnboardingFlag = (
  base: OnboardingActionFlagType | undefined,
  override: OnboardingActionFlagType | undefined,
): OnboardingActionFlagType | undefined => {
  if (override === undefined) return base;
  if (base === undefined) return override;
  if (typeof override === "boolean") return override;
  if (typeof base === "boolean") {
    return ONBOARDING_ACTION_KEYS.reduce<
      Partial<Record<OnboardingActionKey, boolean>>
    >((acc, key) => {
      acc[key] = override[key] ?? base;
      return acc;
    }, {});
  }
  return { ...base, ...override };
};

/**
 * Resolves the FontAwesome icon for a single action key, applying optional
 * overrides on top of the library defaults.
 */
export const resolveOnboardingIcon = (
  icons: OnboardingActionIconsType | undefined,
  action: OnboardingActionKey,
): IconDefinition => icons?.[action] ?? DEFAULT_ONBOARDING_ICONS[action];

/**
 * Builds the className for a single onboarding step action button based on
 * resolved display flags.
 */
export const buildStepButtonClassName = (
  action: OnboardingActionKey,
  alwaysShowIcon: OnboardingActionFlagType | undefined,
  alwaysHideIcon: OnboardingActionFlagType | undefined,
  alwaysHideLabel: OnboardingActionFlagType | undefined,
  showLabelOnMobile: OnboardingActionFlagType | undefined,
): string => {
  const hideLabel = resolveOnboardingFlag(alwaysHideLabel, action);
  const hideIcon = !hideLabel && resolveOnboardingFlag(alwaysHideIcon, action);
  const showLabelMobile =
    !hideLabel &&
    (hideIcon || resolveOnboardingFlag(showLabelOnMobile, action));
  const showIconDesktop =
    !hideLabel && !hideIcon && resolveOnboardingFlag(alwaysShowIcon, action);
  return [
    "step-button",
    showLabelMobile ? "step-button--show-label-mobile" : "",
    showIconDesktop ? "step-button--show-icon-desktop" : "",
    hideIcon ? "step-button--hide-icon" : "",
    hideLabel ? "step-button--hide-label" : "",
  ]
    .filter(Boolean)
    .join(" ");
};
