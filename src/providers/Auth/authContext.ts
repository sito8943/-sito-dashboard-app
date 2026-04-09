import { createContext, useContext } from "react";

import type { AuthProviderContextType } from "./types";

/** React context for authentication session state and actions. */
export const AuthContext = createContext<AuthProviderContextType | undefined>(
  undefined,
);

/**
 * Returns AuthContext value and throws when provider is missing.
 * @returns Required auth context value.
 * @throws {Error} If used outside `AuthProvider`.
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};

/**
 * Returns AuthContext value or undefined when provider is absent.
 * @returns Optional auth context value.
 */
export const useOptionalAuthContext = () => {
  return useContext(AuthContext);
};
