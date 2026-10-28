import { useState, useCallback, useMemo } from "react";
import type { BottomNavigationCenterActionType } from "@/components/organisms/BottomNavigation/types";

// types
import type { BasicProviderPropTypes } from "@/providers/types";

// context
import {
  BottomNavActionContext,
  type BottomNavActionContextType,
} from "./BottomNavActionContext";

export const BottomNavActionProvider = ({
  children,
}: BasicProviderPropTypes) => {
  const [centerAction, setCenterActionState] =
    useState<BottomNavigationCenterActionType | null>(null);

  const setCenterAction = useCallback(
    (action: BottomNavigationCenterActionType | null) =>
      setCenterActionState(action),
    [],
  );

  const value = useMemo<BottomNavActionContextType>(
    () => ({ centerAction, setCenterAction }),
    [centerAction, setCenterAction],
  );

  return (
    <BottomNavActionContext.Provider value={value}>
      {children}
    </BottomNavActionContext.Provider>
  );
};
