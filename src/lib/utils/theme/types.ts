/** User preference; `system` follows `prefers-color-scheme`. */
export type ThemeMode = "system" | "light" | "dark";

/** Theme actually painted on screen. */
export type ResolvedTheme = Exclude<ThemeMode, "system">;

/** `<meta name="theme-color">` value per resolved theme. */
export type ThemeColors = Partial<Record<ResolvedTheme, string>>;

export type ThemeBootScriptOptions = {
  /** localStorage key; must match `ThemeProvider`'s `storageKey`. */
  storageKey?: string;
  /** Mode used when nothing is stored; must match `ThemeProvider`'s `defaultMode`. */
  defaultMode?: ThemeMode;
};
