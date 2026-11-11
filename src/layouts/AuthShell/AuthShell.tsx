import { classNames } from "@sito/dashboard";

import { AuthShellPropsType } from "./types";

/**
 * Wrapper for auth routes. Renders `children` (typically `<Outlet />` from the
 * consumer router). Toasts come from `NotificationProvider`. Error boundary and
 * authenticated-redirect logic stay in the consumer app where routes are known.
 */
export const AuthShell = (props: AuthShellPropsType) => {
  const { children, className } = props;

  return <div className={classNames("auth-shell", className)}>{children}</div>;
};
