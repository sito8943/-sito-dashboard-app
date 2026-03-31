import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

type Item = NotificationType & { closing: boolean };

const ANIM_MS = 300;

const resolvedType = (type?: NotificationEnumType) =>
  type ?? NotificationEnumType.error;

const renderIcon = (type: NotificationEnumType) => {
  switch (type) {
    case NotificationEnumType.error:
      return faWarning;
    default:
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

/** Renders portal-based toast notifications managed by NotificationProvider. */
export function Notification() {
  const { t } = useTranslation();

  const { notification, removeNotification } = useNotification();

  // Single state: each item carries its own closing flag.
  // Eliminates the separate `visible` array + `closing` Set.
  const [items, setItems] = useState<Item[]>([]);

  // "Latest value" ref — kept in sync via useLayoutEffect (runs synchronously
  // after each commit, before useEffect) so the notification sync effect always
  // reads the current rendered items without adding them to its own dep array.
  const itemsRef = useRef(items);
  useLayoutEffect(() => {
    itemsRef.current = items;
  });

  // Shared timer for provider-driven transitions (clear-all and replace).
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Close with animation ────────────────────────────────────────────────
  // id=undefined → close all; id=number → close one.
  const close = useCallback(
    (id?: number) => {
      setItems((prev) =>
        id !== undefined
          ? prev.map((i) => (i.id === id ? { ...i, closing: true } : i))
          : prev.map((i) => ({ ...i, closing: true })),
      );

      if (id !== undefined) {
        // Individual close — loose timer; stale-id no-ops are harmless.
        setTimeout(() => {
          removeNotification(id);
          setItems((prev) => prev.filter((i) => i.id !== id));
        }, ANIM_MS);
      } else {
        // Close all — use the shared timer so cleanup can cancel it.
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          removeNotification();
          setItems([]);
          timerRef.current = null;
        }, ANIM_MS);
      }
    },
    [removeNotification],
  );

  // ── Sync provider → items (with animation) ─────────────────────────────
  // All setItems calls live inside setTimeout callbacks to satisfy the
  // react-hooks/set-state-in-effect rule.
  useEffect(() => {
    // Local timer for the "mark as closing" step (fires at ~0 ms).
    // timerRef holds the "clear / replace" step (fires at ANIM_MS).
    let markClosingTimer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (markClosingTimer) clearTimeout(markClosingTimer);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (notification.length === 0) {
      // Provider cleared all — play exit animation instead of instant wipe.
      if (itemsRef.current.length === 0) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      // Step 1: mark all as closing so the CSS animation starts.
      markClosingTimer = setTimeout(() => {
        setItems((prev) => prev.map((i) => ({ ...i, closing: true })));
        markClosingTimer = null;
      }, 0);
      // Step 2: clear items once the animation has finished.
      timerRef.current = setTimeout(() => {
        setItems([]);
        timerRef.current = null;
      }, ANIM_MS);
      return cleanup;
    }

    const prevIds = new Set(itemsRef.current.map((i) => i.id));
    const hasNew = notification.some(
      (n) => n.id !== undefined && !prevIds.has(n.id),
    );
    if (!hasNew) return;

    if (itemsRef.current.length === 0) {
      // No visible items — show incoming on next tick.
      const incoming = [...notification];
      markClosingTimer = setTimeout(() => {
        setItems(incoming.map((n) => ({ ...n, closing: false })));
        markClosingTimer = null;
      }, 0);
      return () => {
        if (markClosingTimer) clearTimeout(markClosingTimer);
      };
    }

    // Existing items + new notifications: animate out old, then show new.
    if (timerRef.current) clearTimeout(timerRef.current);
    markClosingTimer = setTimeout(() => {
      setItems((prev) =>
        prev.every((i) => i.closing)
          ? prev // already animating out, avoid spurious update
          : prev.map((i) => ({ ...i, closing: true })),
      );
      markClosingTimer = null;
    }, 0);
    const incoming = [...notification];
    timerRef.current = setTimeout(() => {
      setItems(incoming.map((n) => ({ ...n, closing: false })));
      timerRef.current = null;
    }, ANIM_MS);
    return cleanup;
  }, [notification]);

  // ── Click outside + ESC to dismiss all ────────────────────────────────
  useEffect(() => {
    if (!items.length) return;

    let clickHandler: ((e: MouseEvent) => void) | undefined;
    // Defer attaching the click handler so the click that triggered the
    // notification to appear never immediately dismisses it.
    const deferTimerId = window.setTimeout(() => {
      clickHandler = () => close();
      window.addEventListener("click", clickHandler);
    }, 0);

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", keyHandler);

    return () => {
      window.clearTimeout(deferTimerId);
      if (clickHandler) window.removeEventListener("click", clickHandler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [items.length, close]);

  return createPortal(
    <div className={`notification-portal ${items.length ? "active" : ""}`}>
      {items.map(({ id, type, message, closing }) => {
        const resolvedT = resolvedType(type);
        return (
          <div
            key={id}
            className={`notification ${closing ? "closing" : ""} ${bgColor(resolvedT)}`}
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
                if (id !== undefined) close(id);
              }}
              iconClassName={`${textColor(resolvedT)} notification-close-icon`}
              name={t("_accessibility:buttons.closeNotification")}
              aria-label={t("_accessibility:ariaLabels.closeNotification")}
            />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
