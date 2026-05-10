import { BottomNavigationCenterActionType } from "../../components";

export type BottomNavActionRegistrationType =
  | BottomNavigationCenterActionType
  | (() => void)
  | null;
