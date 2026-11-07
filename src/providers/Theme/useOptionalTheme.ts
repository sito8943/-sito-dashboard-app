import { useContext } from "react";

// types
import type { ThemeContextType } from "./types";
import { ThemeContext } from "./ThemeContext";

/**
 * Reads the theme context without requiring a provider.
 * @returns Theme context, or `undefined` outside `ThemeProvider`.
 */
export const useOptionalTheme = (): ThemeContextType | undefined =>
  useContext(ThemeContext);
