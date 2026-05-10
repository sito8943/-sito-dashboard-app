import { createContext } from "react";

// types
import type { AuthProviderContextType } from "./types";

/** React context for authentication session state and actions. */
export const AuthContext = createContext<AuthProviderContextType | undefined>(
  undefined,
);
