import { useContext } from "react";

// types
import { AuthContext } from "./authContext";

/**
 * Returns AuthContext value or undefined when provider is absent.
 * @returns Optional auth context value.
 */
export const useOptionalAuthContext = () => {
  return useContext(AuthContext);
};
