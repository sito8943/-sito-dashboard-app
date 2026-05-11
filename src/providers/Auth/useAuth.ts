import { useAuthContext } from "./useAuthContext";

/**
 * useAuth hook
 * @returns Auth context values from `AuthProvider`.
 */
export const useAuth = () => {
  return useAuthContext();
};
