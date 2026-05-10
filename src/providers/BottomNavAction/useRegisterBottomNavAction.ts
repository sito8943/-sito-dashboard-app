import { useEffect, useRef } from "react";

// hooks
import { useBottomNavAction } from "./useBottomNavAction";

// types
import type { BottomNavActionRegistrationType } from "./types";

// utils
import { normalizeBottomNavAction, toActionRegistrationKey } from "./utils";

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
