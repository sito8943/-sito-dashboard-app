import { classNames } from "@sito/dashboard";

import { Notification } from "components/Notification";

import { AuthShellPropsType } from "./types";

/**
 * Wrapper for auth routes. Renders `children` (typically `<Outlet />` from the
 * consumer router) plus the global `Notification` portal. Error boundary and
 * authenticated-redirect logic stay in the consumer app where routes are known.
 */
export const AuthShell = (props: AuthShellPropsType) => {
  const { children, withNotification = true, className } = props;

  return (
    <div className={classNames("auth-shell", className)}>
      {children}
      {withNotification && <Notification />}
    </div>
  );
};
