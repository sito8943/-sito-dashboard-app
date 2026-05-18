import { useState } from "react";

import { Drawer } from "components/Drawer";
import { Navbar } from "components/Navbar";
import { OfflineBanner } from "components/OfflineBanner";

import { DashboardHeaderPropsType } from "./types";

/**
 * Combined app header: `Drawer` + `Navbar` (+ optional `OfflineBanner`).
 * Owns the drawer open/close state internally; consumer supplies `menuMap`.
 */
export const DashboardHeader = <MenuKeys,>(
  props: DashboardHeaderPropsType<MenuKeys>,
) => {
  const { menuMap, logo, showOfflineBanner = false, navbarProps } = props;

  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <>
      <Drawer<MenuKeys>
        menuMap={menuMap}
        logo={logo}
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
      />
      {showOfflineBanner && <OfflineBanner />}
      <Navbar {...navbarProps} openDrawer={() => setShowDrawer(true)} />
    </>
  );
};
