import { ReactElement } from "react";

// lib
import { MenuItemType, Location } from "lib";

export type DrawerPropsTypes<MenuKeys> = {
  open: boolean;
  onClose: () => void;
  menuMap: MenuItemType<MenuKeys>[];
  location: Location;
  linkComponent: ReactElement;
};
