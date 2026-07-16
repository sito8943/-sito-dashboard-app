// lib
import { MenuItemType } from "lib";

export type DrawerPropsTypes<MenuKeys extends string = string> = {
  logo?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  menuMap: MenuItemType<MenuKeys>[];
};
