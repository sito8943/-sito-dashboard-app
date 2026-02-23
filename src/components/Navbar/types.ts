import { IconButtonPropsLocalType } from "../Buttons/IconButton";

export type NavbarPropsType = {
  menuButtonProps?: IconButtonPropsLocalType;
  openDrawer: () => void;
  showClock?: boolean;
  showSearch?: boolean;
};
