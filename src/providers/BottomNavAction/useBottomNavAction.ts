import { useContext, useEffect } from "react";
import { BottomNavActionContext } from "./BottomNavActionContext";
import type { BottomNavigationCenterActionType } from "components/BottomNavigation/types";

export type BottomNavActionRegistrationType =
  | BottomNavigationCenterActionType
  | (() => void)
  | null;

const normalizeBottomNavAction = (
  action: BottomNavActionRegistrationType,
): BottomNavigationCenterActionType | null => {
  if (!action) return null;
  if (typeof action === "function") return { onClick: () => action() };
  return action;
};

/**
 * Returns the current bottom nav action context or undefined when provider is absent.
 */
export const useOptionalBottomNavAction = () => {
  return useContext(BottomNavActionContext);
};

/**
 * Returns the current bottom nav action context.
 */
export const useBottomNavAction = () => {
  const ctx = useOptionalBottomNavAction();
  if (!ctx)
    throw new Error(
      "useBottomNavAction must be used within BottomNavActionProvider",
    );
  return ctx;
};

/**
 * Registers an action for the bottom navigation center button.
 * Automatically clears the action on unmount.
 */
export const useRegisterBottomNavAction = (
  action: BottomNavActionRegistrationType,
) => {
  const { setCenterAction } = useBottomNavAction();

  useEffect(() => {
    setCenterAction(normalizeBottomNavAction(action));
    return () => setCenterAction(null);
  }, [action, setCenterAction]);
};
