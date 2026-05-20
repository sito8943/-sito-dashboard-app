import { classNames } from "@sito/dashboard";

import type { AuthScreenShellPropsType } from "./types";

import "./styles.css";

export const AuthScreenShell = (props: AuthScreenShellPropsType) => {
  const {
    title,
    logo,
    headerExtra,
    children,
    actions,
    footer,
    className,
    contentClassName,
    actionsClassName,
    footerClassName,
    titleClassName,
    headerClassName,
    motion = "stagger",
    formProps,
  } = props;

  const shellClassName = classNames(
    "auth-screen-shell",
    motion !== "none" && "auth-screen-motion",
    motion === "blur" && "auth-screen-motion-blur",
    motion === "stagger" && "auth-screen-motion-stagger",
    className,
    formProps?.className,
  );

  const content = (
    <>
      {(logo || title || headerExtra) && (
        <div
          className={classNames(
            "auth-screen-header auth-screen-motion-block auth-screen-motion-block-1",
            headerClassName,
          )}
        >
          {logo}
          {title && (
            <h1 className={classNames("auth-screen-title", titleClassName)}>
              {title}
            </h1>
          )}
          {headerExtra}
        </div>
      )}

      {children && (
        <div
          className={classNames(
            "auth-screen-content auth-screen-motion-block auth-screen-motion-block-2",
            contentClassName,
          )}
        >
          {children}
        </div>
      )}

      {actions && (
        <div
          className={classNames(
            "auth-screen-actions auth-screen-motion-block auth-screen-motion-block-3",
            actionsClassName,
          )}
        >
          {actions}
        </div>
      )}

      {footer && (
        <div
          className={classNames(
            "auth-screen-footer auth-screen-motion-block auth-screen-motion-block-4",
            footerClassName,
          )}
        >
          {footer}
        </div>
      )}
    </>
  );

  return (
    <div className="auth-screen-root">
      {formProps ? (
        <form {...formProps} className={shellClassName}>
          {content}
        </form>
      ) : (
        <div className={shellClassName}>{content}</div>
      )}
    </div>
  );
};
