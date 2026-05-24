import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowLeft,
  faArrowRight,
  faForward,
  faRightToBracket,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";

// types
import { OnboardingActionKey } from "./types";

export const ONBOARDING_ACTION_KEYS: OnboardingActionKey[] = [
  "back",
  "next",
  "skip",
  "startAsGuest",
  "signIn",
];

export const DEFAULT_ONBOARDING_ICONS: Record<
  OnboardingActionKey,
  IconDefinition
> = {
  back: faArrowLeft,
  next: faArrowRight,
  skip: faForward,
  startAsGuest: faUserSecret,
  signIn: faRightToBracket,
};
