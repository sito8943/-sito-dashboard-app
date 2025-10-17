// lib
import { MenuItemType } from "lib";

export type DrawerPropsTypes<MenuKeys> = {
  open: boolean;
  onClose: () => void;
  menuMap: MenuItemType<MenuKeys>[];
};
