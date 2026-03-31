import { createContext, useContext } from "react";

import type { AuthProviderContextType } from "./types";

/** React context for authentication session state and actions. */
export const AuthContext = createContext<AuthProviderContextType | undefined>(
  undefined,
);

/** Returns AuthContext value and throws when provider is missing. */
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("authContext must be used within a Provider");
  return context;
};

/** Returns AuthContext value or undefined when provider is absent. */
export const useOptionalAuthContext = () => {
  return useContext(AuthContext);
};
