import { IconButtonPropsType } from "components/Buttons/types";

export type NavbarPropsType = {
  menuButtonProps?: IconButtonPropsType;
  openDrawer: () => void;
  showClock?: boolean;
  showSearch?: boolean;
};
