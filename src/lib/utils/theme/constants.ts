import type { ThemeMode } from "./types";

/** Default localStorage key used by `ThemeProvider` and the boot script. */
export const DEFAULT_THEME_STORAGE_KEY = "sito-theme";

/** Default mode when nothing is stored. */
export const DEFAULT_THEME_MODE: ThemeMode = "system";

export const THEME_MODES: readonly ThemeMode[] = ["system", "light", "dark"];

/** Class toggled on `<html>` when the resolved theme is dark. */
export const DARK_THEME_CLASS = "dark";

export const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
