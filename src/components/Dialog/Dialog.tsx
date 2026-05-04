import { useCallback, useEffect, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "@sito/dashboard";

// icons
import { faClose } from "@fortawesome/free-solid-svg-icons";

// lib
import { classNames } from "@sito/dashboard";

// types
import { DialogPropsType } from "./types";
import { lockBodyScroll, unlockBodyScroll } from "./bodyScrollLock";

// components
import { AppIconButton } from "components";

// styles
import "./styles.css";

/**
 * Renders a portal-based modal dialog with backdrop and close behavior.
 * @param props - Dialog props.
 * @returns Modal dialog portal.
 */
export const Dialog = (props: DialogPropsType) => {
  const { t } = useTranslation();
  const {
    title,
    children,
    handleClose,
    open = false,
    mobileFullScreen = false,
    containerClassName = "",
    className = "",
    animationClass = "appear",
  } = props;

  const onKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    },
    [open, handleClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  }, [onKeyPress]);

  const bigHandleClose = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  return createPortal(
    <div
      aria-label={t("_accessibility:ariaLabels.closeDialog")}
      aria-hidden={!open}
      onClick={bigHandleClose}
      className={classNames(
        "dialog-backdrop animated",
        open ? `opened ${animationClass}` : "closed",
        containerClassName,
      )}
    >
      <div
        className={classNames(
          "dialog elevated animated",
          !mobileFullScreen && "dialog-framed",
          mobileFullScreen && "dialog-mobile-full-screen",
          open ? `opened ${animationClass}` : "closed",
          className,
        )}
      >
        <div className="dialog-header">
          <h3 className="dialog-title">{title}</h3>
          <AppIconButton
            icon={faClose}
            disabled={!open}
            aria-disabled={!open}
            onClick={handleClose}
            variant="text"
            color="error"
            className="icon-button dialog-close-btn"
            name={t("_accessibility:buttons.closeDialog")}
            aria-label={t("_accessibility:ariaLabels.closeDialog")}
          />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};
