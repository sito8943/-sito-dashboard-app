import { ReactNode } from "react";

export type AppShellPropsType = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  bottomNavigation?: ReactNode;
  extras?: ReactNode;
  withNotification?: boolean;
  className?: string;
};
