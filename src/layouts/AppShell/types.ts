import { ReactNode } from "react";

export type AppShellPropsType = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  bottomNavigation?: ReactNode;
  extras?: ReactNode;
  /**
   * @deprecated No effect. `NotificationProvider` renders the toasts, so the
   * shell no longer mounts a `Notification` portal. Will be removed in a
   * future minor.
   */
  withNotification?: boolean;
  className?: string;
};
