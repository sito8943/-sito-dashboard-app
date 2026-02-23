import { IconButtonPropsType } from "@sito/dashboard";

export type NavbarPropsType = {
  menuButtonProps?: IconButtonPropsType;
  openDrawer: () => void;
  showClock?: boolean;
  showSearch?: boolean;
};
