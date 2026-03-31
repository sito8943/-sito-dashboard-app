import { createContext } from "react";
import type { BottomNavigationCenterActionType } from "components/BottomNavigation/types";

export type BottomNavActionContextType = {
  centerAction: BottomNavigationCenterActionType | null;
  setCenterAction: (action: BottomNavigationCenterActionType | null) => void;
};

export const BottomNavActionContext = createContext<
  BottomNavActionContextType | undefined
>(undefined);
