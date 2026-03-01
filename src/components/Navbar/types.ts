import { ReactNode } from "react";
import { IconButtonPropsLocalType } from "../Buttons/IconButton";

export type NavbarPropsType = {
  menuButtonProps?: IconButtonPropsLocalType;
  openDrawer: () => void;
  showSearch?: boolean;
};

export type NavbarProviderPropTypes = {
  children: ReactNode;
};

export type NavbarContextType = {
  title: string;
  setTitle: (value: string) => void;
  rightContent: ReactNode;
  setRightContent: (value: ReactNode) => void;
};
