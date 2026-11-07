import {
  DARK_SCHEME_QUERY,
  DARK_THEME_CLASS,
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_STORAGE_KEY,
  THEME_MODES,
} from "./constants";
import type {
  ResolvedTheme,
  ThemeBootScriptOptions,
  ThemeColors,
  ThemeMode,
} from "./types";

/**
 * Type guard for persisted theme values.
 * @param value - Raw value (e.g. from localStorage).
 * @returns Whether the value is a valid `ThemeMode`.
 */
export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === "string" && THEME_MODES.includes(value as ThemeMode);

/**
 * Reads the stored theme mode, falling back when missing/invalid/unavailable.
 * @param storageKey - localStorage key.
 * @param fallback - Mode returned when nothing valid is stored.
 * @returns Stored or fallback mode.
 */
export const readStoredThemeMode = (
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
  fallback: ThemeMode = DEFAULT_THEME_MODE,
): ThemeMode => {
  try {
    const value = localStorage.getItem(storageKey);
    return isThemeMode(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Persists the theme mode. Silently ignores unavailable storage (private mode).
 * @param mode - Mode to store.
 * @param storageKey - localStorage key.
 */
export const persistThemeMode = (
  mode: ThemeMode,
  storageKey: string = DEFAULT_THEME_STORAGE_KEY,
) => {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // storage unavailable: the choice lasts this session only
  }
};

/**
 * @returns Whether the OS/browser currently prefers a dark color scheme.
 */
export const prefersDarkScheme = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(DARK_SCHEME_QUERY).matches;

/**
 * Resolves a mode to the theme actually painted.
 * @param mode - User preference.
 * @param systemPrefersDark - Current `prefers-color-scheme: dark` match.
 * @returns `light` or `dark`.
 */
export const resolveTheme = (
  mode: ThemeMode,
  systemPrefersDark: boolean,
): ResolvedTheme => {
  if (mode === "system") return systemPrefersDark ? "dark" : "light";
  return mode;
};

/**
 * Applies the resolved theme to `<html>` (`dark` class + `color-scheme`) and,
 * when a color is provided, to `<meta name="theme-color">`.
 * @param theme - Resolved theme.
 * @param themeColors - Optional meta theme-color per theme.
 */
export const applyResolvedTheme = (
  theme: ResolvedTheme,
  themeColors?: ThemeColors,
) => {
  const root = document.documentElement;
  root.classList.toggle(DARK_THEME_CLASS, theme === "dark");
  root.style.colorScheme = theme;

  const color = themeColors?.[theme];
  if (!color) return;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", color);
};

/**
 * Builds the inline script to place in `index.html` `<head>` so the stored
 * theme is applied before first paint (no flash of the wrong theme).
 * @param options - Must match the `ThemeProvider` props.
 * @returns Script source (without `<script>` tags).
 */
export const getThemeBootScript = (options: ThemeBootScriptOptions = {}) => {
  const {
    storageKey = DEFAULT_THEME_STORAGE_KEY,
    defaultMode = DEFAULT_THEME_MODE,
  } = options;

  return `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)});if(m!=="system"&&m!=="light"&&m!=="dark")m=${JSON.stringify(defaultMode)};var d=m==="dark"||(m==="system"&&window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches);var r=document.documentElement;if(d)r.classList.add(${JSON.stringify(DARK_THEME_CLASS)});r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
};

/** Boot script for the default `storageKey` (`"sito-theme"`) and `defaultMode` (`"system"`). */
export const THEME_BOOT_SCRIPT = getThemeBootScript();
