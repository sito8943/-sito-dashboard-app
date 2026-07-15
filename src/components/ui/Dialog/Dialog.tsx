import { FormEvent, MouseEvent, useCallback, useEffect, useRef } from "react";
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
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const {
    dialogId,
    title,
    children,
    handleClose,
    initialFocus,
    closeOnBackdropClick = false,
    onSubmit,
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
      if (closeOnBackdropClick && e.target === e.currentTarget) handleClose();
    },
    [closeOnBackdropClick, handleClose],
  );

  const handleFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit?.(e);
    },
    [onSubmit],
  );

  useEffect(() => {
    if (!open) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !initialFocus) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    if (initialFocus === "first-input") {
      const primaryInput = dialog.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
      );

      primaryInput?.focus();
      return;
    }

    const submitButton = dialog.querySelector<HTMLElement>(
      'button[type="submit"]:not([disabled]), input[type="submit"]:not([disabled])',
    );

    submitButton?.focus();
  }, [open, initialFocus]);

  return createPortal(
    <div
      id={dialogId ? `backdrop-${dialogId}` : undefined}
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
        id={dialogId}
        ref={dialogRef}
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
        {onSubmit ? (
          <form onSubmit={handleFormSubmit}>{children}</form>
        ) : (
          children
        )}
      </div>
    </div>,
    document.body,
  );
};
