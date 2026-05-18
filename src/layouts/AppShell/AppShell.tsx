import { classNames } from "@sito/dashboard";

import { Notification } from "components/Notification";

import { AppShellPropsType } from "./types";

/**
 * Authenticated app layout shell. Mounts header/content/footer/bottom-nav slots
 * plus the global `Notification` portal. Consumer is expected to wrap with
 * `ConfigProvider` / `NavbarProvider` / `BottomNavActionProvider` (e.g. via
 * `AppProviders`) before mounting `AppShell`. `Tooltip`, `Onboarding`, and PWA
 * dialogs can be passed through the `extras` slot.
 */
export const AppShell = (props: AppShellPropsType) => {
  const {
    children,
    header,
    footer,
    bottomNavigation,
    extras,
    withNotification = true,
    className,
  } = props;

  return (
    <div className={classNames("app-shell", className)}>
      {header}
      {children}
      {footer}
      {bottomNavigation}
      {extras}
      {withNotification && <Notification />}
    </div>
  );
};
