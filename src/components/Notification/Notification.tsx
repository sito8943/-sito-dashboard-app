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
import { NotificationEnumType, NotificationType } from "lib";

// components
import { AppIconButton } from "../Buttons";

// styles
import "./styles.css";

const resolvedType = (type?: NotificationEnumType) =>
  type ?? NotificationEnumType.error;

const renderIcon = (type: NotificationEnumType) => {
  switch (type) {
    case NotificationEnumType.error:
      return faWarning;
    default: // success
      return faCircleCheck;
  }
};

const textColor = (type: NotificationEnumType) => {
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
};

const bgColor = (type: NotificationEnumType) => {
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
};

export function Notification() {
  const { t } = useTranslation();

  const { notification, removeNotification } = useNotification();

  // `visible` is what's actually rendered. It lags behind `notification` during
  // close transitions so new notifications don't appear until old ones finish.
  const [visible, setVisible] = useState<NotificationType[]>([]);
  const visibleRef = useRef<NotificationType[]>(visible);

  // Latest notification ref so timer callbacks always read the freshest value.
  const notificationRef = useRef(notification);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  const [closing, setClosing] = useState<Set<number>>(new Set());

  // Single shared timer for close transitions (prevents overlapping timeouts).
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── close-with-animation ──────────────────────────────────────────────────
  // Operates on `visibleRef` so it always has the currently rendered items,
  // regardless of what the provider has since pushed.
  const closeWithAnimation = useCallback(
    (id?: number) => {
      const current = visibleRef.current;

      if (id === undefined) {
        // Close all currently visible items.
        const idsToClose = current
          .map((n) => n.id)
          .filter((nId): nId is number => nId !== undefined);
        setClosing(new Set(idsToClose));

        if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);

        transitionTimerRef.current = setTimeout(() => {
          idsToClose.forEach((nId) => removeNotification(nId));
          setVisible([]);
          transitionTimerRef.current = null;
        }, 300);
      } else {
        setClosing((prev) => new Set(prev).add(id));
        window.setTimeout(() => {
          removeNotification(id);
          setVisible((prev) => prev.filter((n) => n.id !== id));
        }, 300);
      }
    },
    [removeNotification]
  );

  // ── sync provider → visible, with transitions ─────────────────────────────
  // When new notifications arrive while items are already displayed, play the
  // close animation on the current ones first, then show the incoming ones.
  useEffect(() => {
    const current = visibleRef.current;

    if (notification.length === 0) {
      if (current.length > 0) {
        const clearTimerId = setTimeout(() => {
          setVisible([]);
          setClosing(new Set());
        }, 0);
        return () => clearTimeout(clearTimerId);
      }
      return;
    }

    if (current.length === 0) {
      const showTimerId = setTimeout(() => {
        setVisible(notification);
      }, 0);
      return () => clearTimeout(showTimerId);
    }

    // Detect whether new (unseen) IDs appeared.
    const currentIds = new Set(current.map((n) => n.id));
    const hasNew = notification.some(
      (n) => n.id !== undefined && !currentIds.has(n.id)
    );

    if (!hasNew) {
      // Same or fewer items — closeWithAnimation handles removals directly.
      return;
    }

    // Replacement: animate current out, then show incoming.
    const idsToClose = current
      .map((n) => n.id)
      .filter((id): id is number => id !== undefined);
    const closingTimerId = setTimeout(() => {
      setClosing(new Set(idsToClose));
    }, 0);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    transitionTimerRef.current = setTimeout(() => {
      idsToClose.forEach((id) => removeNotification(id));
      setVisible([...notificationRef.current]);
      setClosing(new Set());
      transitionTimerRef.current = null;
    }, 300);

    return () => clearTimeout(closingTimerId);
  }, [notification, removeNotification]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  // ── window click: dismiss by clicking outside ─────────────────────────────
  const windowClickHandlerRef = useRef<(e: MouseEvent) => void>();

  useEffect(() => {
    windowClickHandlerRef.current = () => closeWithAnimation();
  }, [closeWithAnimation]);

  useEffect(() => {
    if (!visible.length) return;
    // Defer attaching the handler with setTimeout(0) so the click that
    // triggered the notification to appear never fires the close handler.
    let handler: ((e: MouseEvent) => void) | undefined;
    const timerId = window.setTimeout(() => {
      handler = (e: MouseEvent) => windowClickHandlerRef.current?.(e);
      window.addEventListener("click", handler);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      if (handler) window.removeEventListener("click", handler);
    };
  }, [visible.length]);

  // ── keyboard: Escape to dismiss ───────────────────────────────────────────
  const onKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && visible.length) closeWithAnimation();
    },
    [visible.length, closeWithAnimation]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, [onKeyPress]);

  return createPortal(
    <div
      className={`notification-portal ${visible.length ? "active" : ""}`}
    >
      {visible.map(({ id, type, message }) => {
        const resolvedT = resolvedType(type);
        return (
          <div
            key={id}
            className={`notification ${id !== undefined && closing.has(id) ? "closing" : ""} ${bgColor(resolvedT)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-body">
              <FontAwesomeIcon
                icon={renderIcon(resolvedT)}
                className={`notification-icon ${textColor(resolvedT)}`}
              />
              <p className={`notification-text ${textColor(resolvedT)}`}>
                {message}
              </p>
            </div>
            <AppIconButton
              type="button"
              icon={faClose}
              color="error"
              className="notification-close group"
              onClick={(e) => {
                e.stopPropagation();
                if (id !== undefined) closeWithAnimation(id);
              }}
              iconClassName={`${textColor(resolvedT)} notification-close-icon`}
              name={t("_accessibility:buttons.closeNotification")}
              aria-label={t("_accessibility:ariaLabels.closeNotification")}
            />
          </div>
        );
      })}
    </div>,
    document.body
  );
}
