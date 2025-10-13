import { ReactElement } from "react";

// any
import { Location } from "lib";

export type NavbarPropsType = {
  openDrawer: () => void;
  searchComponent: ReactElement;
  location: Location;
};
