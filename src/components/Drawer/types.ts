// lib
import { MenuItemType } from "lib";

export type DrawerPropsTypes<MenuKeys> = {
  logo?: React.ReactNode;
  open: boolean;
  onClose: () => void;
  menuMap: MenuItemType<MenuKeys>[];
};
