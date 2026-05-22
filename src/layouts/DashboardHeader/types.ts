import { ReactNode } from "react";

import { MenuItemType } from "lib";

import type { NavbarPropsType } from "components/app/Navbar/types";

export type DashboardHeaderPropsType<MenuKeys> = {
  menuMap: MenuItemType<MenuKeys>[];
  logo?: ReactNode;
  showOfflineBanner?: boolean;
  navbarProps?: Omit<NavbarPropsType, "openDrawer">;
};
