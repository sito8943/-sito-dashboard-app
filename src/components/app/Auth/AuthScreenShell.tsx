import { useContext } from "react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { classNames } from "@sito/dashboard";

import { AppIconButton } from "components";
import { ConfigContext } from "providers/ConfigContext";

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
    showBackButton,
    backTo,
    backButtonLabel = "Back",
    backButtonClassName,
    onBack,
    motion = "stagger",
    formProps,
  } = props;
  const config = useContext(ConfigContext);
  const hasBackTarget = backTo !== undefined;
  const shouldRenderBackButton = Boolean(
    (showBackButton || hasBackTarget || onBack) && (onBack || config),
  );

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    config?.navigate(backTo ?? -1);
  };

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
      {(shouldRenderBackButton || logo || title || headerExtra) && (
        <div
          className={classNames(
            "auth-screen-header auth-screen-motion-block auth-screen-motion-block-1",
            headerClassName,
          )}
        >
          {(shouldRenderBackButton || logo || title) && (
            <div className="auth-screen-heading">
              {shouldRenderBackButton && (
                <AppIconButton
                  type="button"
                  icon={faArrowLeft}
                  className={classNames(
                    "auth-screen-back-button",
                    backButtonClassName,
                  )}
                  name={backButtonLabel}
                  aria-label={backButtonLabel}
                  onClick={handleBack}
                />
              )}
              {(logo || title) && (
                <div className="auth-screen-heading-content">
                  {logo}
                  {title && (
                    <h1
                      className={classNames(
                        "auth-screen-title",
                        titleClassName,
                      )}
                    >
                      {title}
                    </h1>
                  )}
                </div>
              )}
            </div>
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
