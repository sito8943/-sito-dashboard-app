import { useContext } from "react";

// types
import { AuthContext } from "./authContext";

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
