import { useContext } from "react";

import type { DrawerMenuContextType } from "./types";
import { DrawerMenuContext } from "./DrawerMenuContext";

/**
 * useDrawerMenu hook
 * @returns {DrawerMenuContextType<MenuKeys>} Drawer menu context values.
 */
export const useDrawerMenu = <MenuKeys extends string>() => {
  const context = useContext(DrawerMenuContext);
  return context as DrawerMenuContextType<MenuKeys>;
};
