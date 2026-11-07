import type { ReactNode } from "react";

// lib
import type { ResolvedTheme, ThemeColors, ThemeMode } from "@/lib";

export type ThemeProviderProps = {
  children: ReactNode;
  /** localStorage key for the persisted mode. Default `"sito-theme"`. */
  storageKey?: string;
  /** Mode used when nothing is stored. Default `"system"`. */
  defaultMode?: ThemeMode;
  /** `<meta name="theme-color">` content per resolved theme. */
  themeColors?: ThemeColors;
};

export type ThemeContextType = {
  /** User preference (`system` follows `prefers-color-scheme`). */
  mode: ThemeMode;
  /** Theme actually painted on screen. */
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Switches to the opposite of `resolvedTheme` (stores an explicit mode). */
  toggleTheme: () => void;
};
