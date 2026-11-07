import type { ReactNode } from "react";

// types
import type { IconButtonPropsLocalType } from "@/components/atoms/Buttons/IconButton";

export type NavbarPropsType = {
  menuButtonProps?: IconButtonPropsLocalType;
  openDrawer: () => void;
  showSearch?: boolean;
  /**
   * Shows the light/dark `ThemeToggle` in the right toolbar. Opt-in (default
   * `false`); also requires a `ThemeProvider` above the Navbar.
   */
  showThemeToggle?: boolean;
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
