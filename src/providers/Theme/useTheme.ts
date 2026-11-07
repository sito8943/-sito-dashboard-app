import { useContext } from "react";

// types
import type { ThemeContextType } from "./types";
import { ThemeContext } from "./ThemeContext";

/**
 * Reads the theme context.
 * @returns Theme mode, resolved theme and setters.
 * @throws {Error} If used outside `ThemeProvider`.
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
