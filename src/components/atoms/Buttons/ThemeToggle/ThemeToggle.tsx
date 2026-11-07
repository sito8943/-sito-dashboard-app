import { classNames, useTranslation } from "@sito/dashboard";

// icons
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

// types
import type { ThemeTogglePropsType } from "./types";

// components
import { AppIconButton } from "../IconButton";

// providers
import { useTheme } from "@/providers/Theme/useTheme";

/**
 * Icon button that toggles between light and dark themes. The icon shows the
 * theme you will switch to. Requires `ThemeProvider`.
 * @param props - Icon button props plus optional icon overrides.
 * @returns Theme toggle button.
 */
export const ThemeToggle = (props: ThemeTogglePropsType) => {
  const { t } = useTranslation();
  const { resolvedTheme, toggleTheme } = useTheme();
  const {
    darkIcon = faMoon,
    lightIcon = faSun,
    onClick,
    className,
    ...rest
  } = props;

  const isDark = resolvedTheme === "dark";
  const target = isDark ? "switchToLight" : "switchToDark";

  return (
    <AppIconButton
      type="button"
      name={t(`_accessibility:buttons.${target}`)}
      aria-label={t(`_accessibility:ariaLabels.${target}`)}
      {...rest}
      icon={isDark ? lightIcon : darkIcon}
      className={classNames("theme-toggle", className)}
      onClick={() => {
        toggleTheme();
        onClick?.();
      }}
    />
  );
};
