import { useCallback, useId, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useToast } from "@sito/ui";

// lib
import { NotificationEnumType, NotificationType } from "@/lib";

// types
import type { NotificationContextType } from "../types";
import type { NotificationBridgeProps } from "./types";
import { NotificationContext } from "../NotificationContext";

// constants
import { NO_NOTIFICATIONS } from "./constants";

// utils
import { getNotificationIcon, toToastColor, toToastId } from "./utils";

/**
 * Implements `useNotification()` on top of `@sito/ui`'s `useToast()`. Must be
 * rendered inside `ToastProvider` (done by `NotificationProvider`).
 * @param props - Bridge props.
 * @returns Notification context provider.
 */
export function NotificationBridge(props: NotificationBridgeProps) {
  const { children, max } = props;
  const toast = useToast();
  const idPrefix = useId();

  // Instance-scoped counter keeps ids unique within this provider.
  const nextIdRef = useRef(0);
  // Ids that may still be visible. `@sito/ui` closes the oldest toast past
  // `max`, so only the newest `max` ids are kept. Toasts that left on their
  // own may still be listed; dismissing them again is a no-op.
  const shownIdsRef = useRef<number[]>([]);

  const show = useCallback(
    (options: Partial<NotificationType>) => {
      const id = nextIdRef.current++;
      shownIdsRef.current = [...shownIdsRef.current, id].slice(-max);
      toast({
        id: toToastId(idPrefix, id),
        message: options.message ?? "",
        color: toToastColor(options.type),
        icon: <FontAwesomeIcon icon={getNotificationIcon(options.type)} />,
      });
      return id;
    },
    [idPrefix, max, toast],
  );

  const showNotification = useCallback(
    (options: NotificationType) => show(options),
    [show],
  );

  const showSuccessNotification = useCallback(
    (options: Partial<NotificationType>) =>
      show({ ...options, type: NotificationEnumType.success }),
    [show],
  );

  const showErrorNotification = useCallback(
    (options: Partial<NotificationType>) =>
      show({ ...options, type: NotificationEnumType.error }),
    [show],
  );

  const showStackNotifications = useCallback(
    (notifications: NotificationType[]) =>
      notifications.map((item) => show(item)),
    [show],
  );

  const removeNotification = useCallback(
    (id?: number) => {
      const ids = id === undefined ? shownIdsRef.current : [id];
      ids.forEach((item) => toast.dismiss(toToastId(idPrefix, item)));
      shownIdsRef.current = shownIdsRef.current.filter(
        (item) => !ids.includes(item),
      );
    },
    [idPrefix, toast],
  );

  const value = useMemo<NotificationContextType>(
    () => ({
      notification: NO_NOTIFICATIONS,
      removeNotification,
      showErrorNotification,
      showNotification,
      showSuccessNotification,
      showStackNotifications,
    }),
    [
      removeNotification,
      showErrorNotification,
      showNotification,
      showStackNotifications,
      showSuccessNotification,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
