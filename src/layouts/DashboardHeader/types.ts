import { ReactNode } from "react";

import { MenuItemType } from "@/lib";

import type { NavbarPropsType } from "@/components/organisms/Navbar/types";

export type DashboardHeaderPropsType<MenuKeys extends string> = {
  menuMap: MenuItemType<MenuKeys>[];
  logo?: ReactNode;
  showOfflineBanner?: boolean;
  navbarProps?: Omit<NavbarPropsType, "openDrawer">;
};
