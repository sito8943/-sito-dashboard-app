import { useContext, useEffect, useRef } from "react";
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

const toActionRegistrationKey = (
  action: BottomNavActionRegistrationType,
): string => {
  if (!action) return "null";
  if (typeof action === "function") return "function";

  const { onClick, icon, ...rest } = action;
  const toComparableString = (value: unknown) => {
    if (typeof value === "function") return "__function__";

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const stableRest = Object.entries(rest)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${toComparableString(value)}`)
    .join("|");

  return [
    `rest=${stableRest}`,
    `hasOnClick=${typeof onClick === "function"}`,
    `icon=${icon ? `${icon.prefix}:${icon.iconName}` : "null"}`,
  ].join(";");
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
  const latestActionRef = useRef<BottomNavActionRegistrationType>(action);
  const registrationKey = toActionRegistrationKey(action);

  useEffect(() => {
    latestActionRef.current = action;
  }, [action]);

  useEffect(() => {
    const normalizedAction = normalizeBottomNavAction(latestActionRef.current);

    if (!normalizedAction) {
      setCenterAction(null);
      return;
    }

    setCenterAction({
      ...normalizedAction,
      onClick: normalizedAction.onClick
        ? (event) => {
            const latestAction = normalizeBottomNavAction(
              latestActionRef.current,
            );
            latestAction?.onClick?.(event);
          }
        : undefined,
    });
  }, [registrationKey, setCenterAction]);

  useEffect(() => {
    return () => setCenterAction(null);
  }, [setCenterAction]);
};
