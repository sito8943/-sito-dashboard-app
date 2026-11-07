import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// lib
import {
  DARK_SCHEME_QUERY,
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_STORAGE_KEY,
  applyResolvedTheme,
  persistThemeMode,
  prefersDarkScheme,
  readStoredThemeMode,
  resolveTheme,
} from "@/lib";
import type { ThemeMode } from "@/lib";

// types
import type { ThemeContextType, ThemeProviderProps } from "./types";

import { ThemeContext } from "./ThemeContext";

/**
 * Owns the light/dark theme: persists the user's mode, follows
 * `prefers-color-scheme` while mode is `system`, and applies the `dark` class +
 * `color-scheme` on `<html>` (plus `<meta name="theme-color">` when configured).
 * @param props - Provider props.
 * @returns React component.
 */
export const ThemeProvider = (props: ThemeProviderProps) => {
  const {
    children,
    storageKey = DEFAULT_THEME_STORAGE_KEY,
    defaultMode = DEFAULT_THEME_MODE,
    themeColors,
  } = props;

  const [mode, setModeState] = useState<ThemeMode>(() =>
    readStoredThemeMode(storageKey, defaultMode),
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState(prefersDarkScheme);
  const modeRef = useRef(mode);
  const themeColorsRef = useRef(themeColors);

  useEffect(() => {
    themeColorsRef.current = themeColors;
  }, [themeColors]);

  // The `<html>` class is applied in the handlers BEFORE the state update:
  // children that read CSS variables during render must see the new tokens on
  // that same render (child effects run before ours).
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      applyResolvedTheme(
        resolveTheme(modeRef.current, event.matches),
        themeColorsRef.current,
      );
      setSystemPrefersDark(event.matches);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = resolveTheme(mode, systemPrefersDark);

  // initial sync (an index.html boot script may already have set the class)
  useEffect(() => {
    applyResolvedTheme(resolvedTheme, themeColors);
  }, [resolvedTheme, themeColors]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      modeRef.current = next;
      persistThemeMode(next, storageKey);
      applyResolvedTheme(
        resolveTheme(next, systemPrefersDark),
        themeColorsRef.current,
      );
      setModeState(next);
    },
    [storageKey, systemPrefersDark],
  );

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setMode]);

  const value = useMemo<ThemeContextType>(
    () => ({ mode, resolvedTheme, setMode, toggleTheme }),
    [mode, resolvedTheme, setMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
