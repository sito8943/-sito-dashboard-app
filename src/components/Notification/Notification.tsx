import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@sito/dashboard";
import { createPortal } from "react-dom";

// provider
import { useNotification } from "providers";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClose,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";

// types
import { NotificationEnumType } from "lib";

// components
import { IconButton } from "../Buttons";

// styles
import "./styles.css";

export function Notification() {
  const { t } = useTranslation();

  const { notification, removeNotification } = useNotification();

  // track items that are playing the closing animation
  const [closing, setClosing] = useState<Set<number>>(new Set());

  const closeWithAnimation = useCallback(
    (index?: number) => {
      if (index === undefined) {
        // close all with animation
        const all = new Set<number>(notification.map((_, i) => i));
        setClosing(all);
        window.setTimeout(() => removeNotification(), 300);
      } else {
        setClosing((prev) => new Set(prev).add(index));
        window.setTimeout(() => removeNotification(index), 300);
      }
    },
    [notification, removeNotification]
  );

  const renderIcon = useCallback((type: NotificationEnumType) => {
    switch (type) {
      case NotificationEnumType.error:
        return faWarning;
      default: // success
        return faCircleCheck;
    }
  }, []);

  const textColor = useCallback((type: NotificationEnumType) => {
    switch (type) {
      case NotificationEnumType.success:
        return "!text-success";
      case NotificationEnumType.error:
        return "!text-error";
      case NotificationEnumType.warning:
        return "!text-warning";
      default:
        return "!text-info";
    }
  }, []);

  const bgColor = useCallback((type: NotificationEnumType) => {
    switch (type) {
      case NotificationEnumType.success:
        return "bg-bg-success";
      case NotificationEnumType.error:
        return "bg-bg-error";
      case NotificationEnumType.warning:
        return "bg-bg-warning";
      default:
        return "bg-bg-info";
    }
  }, []);

  const windowClickHandlerRef = useRef<(e: MouseEvent) => void>();

  useEffect(() => {
    windowClickHandlerRef.current = () => closeWithAnimation();
  }, [closeWithAnimation]);

  useEffect(() => {
    if (!notification?.length) return;
    const handler = (e: MouseEvent) => windowClickHandlerRef.current?.(e);
    window.addEventListener("click", handler);
    return () => {
      window.removeEventListener("click", handler);
    };
  }, [notification?.length]);

  const onKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && notification.length) closeWithAnimation();
    },
    [notification, closeWithAnimation]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => {
      window.removeEventListener("keydown", onKeyPress);
    };
  }, [onKeyPress]);

  // reset closing state when list changes externally
  useEffect(() => {
    setClosing(new Set());
  }, [notification]);

  return createPortal(
    <div
      className={`notification-portal ${
        notification?.length ? "w-screen h-screen" : ""
      }`}
    >
      {notification?.length
        ? notification?.map(({ id, type, message }, i) => (
            <div
              key={id}
              className={`notification ${closing.has(i) ? "closing" : ""} ${bgColor(
                type ?? NotificationEnumType.error
              )}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-3 items-center">
                <FontAwesomeIcon
                  icon={renderIcon(type ?? NotificationEnumType.error)}
                  className={`${textColor(type ?? NotificationEnumType.error)}`}
                />
                <p
                  className={`whitespace-nowrap ${textColor(
                    type ?? NotificationEnumType.error
                  )}`}
                >
                  {message}
                </p>
              </div>
              <IconButton
                type="button"
                icon={faClose}
                color="error"
                className="group"
                onClick={(e) => {
                  e.stopPropagation();
                  closeWithAnimation(i);
                }}
                iconClassName={`${textColor(
                  type ?? NotificationEnumType.error
                )} group-hover:!text-red-400 cursor-pointer`}
                name={t("_accessibility:buttons.closeNotification")}
                aria-label={t("_accessibility:ariaLabels.closeNotification")}
              />
            </div>
          ))
        : null}
    </div>,
    document.body
  );
}
