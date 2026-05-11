import { useContext } from "react";

// types
import { BottomNavActionContext } from "./BottomNavActionContext";

/**
 * Returns the current bottom nav action context or undefined when provider is absent.
 */
export const useOptionalBottomNavAction = () => {
  return useContext(BottomNavActionContext);
};
