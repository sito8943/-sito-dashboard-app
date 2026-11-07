import { createContext } from "react";

// types
import type { ThemeContextType } from "./types";

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
