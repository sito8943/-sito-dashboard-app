import { createContext } from "react";

import type { DrawerMenuContextType } from "./types";

const defaultDrawerMenuContext: DrawerMenuContextType<string> = {
  addChildItem: () => {},
  removeChildItem: () => {},
  clearDynamicItems: () => {},
  dynamicItems: {},
};

export const DrawerMenuContext = createContext<DrawerMenuContextType<string>>(
  defaultDrawerMenuContext,
);
