import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// types
import type { IconButtonPropsLocalType } from "../types";

export type ThemeTogglePropsType = Omit<
  IconButtonPropsLocalType,
  "icon" | "onClick"
> & {
  /** Icon shown while the light theme is active (switches to dark). Default `faMoon`. */
  darkIcon?: IconDefinition;
  /** Icon shown while the dark theme is active (switches to light). Default `faSun`. */
  lightIcon?: IconDefinition;
  /** Called after the theme is toggled. */
  onClick?: () => void;
};
