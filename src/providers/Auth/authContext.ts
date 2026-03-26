import { createContext, useContext } from "react";

import type { AuthProviderContextType } from "./types";

export const AuthContext = createContext<AuthProviderContextType | undefined>(
  undefined,
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("authContext must be used within a Provider");
  return context;
};
