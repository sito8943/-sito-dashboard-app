import { createContext } from "react";

// types
import type { NavbarContextType } from "./types.js";

export const NavbarContext = createContext<NavbarContextType | undefined>(
  undefined,
);
