import { useContext } from "react";

import type { NotificationContextType } from "./types";
import { NotificationContext } from "./NotificationContext";

/**
 * Hook to consume the notification context.
 *
 * @returns {NotificationContextType} Notification state and helper methods.
 * `notification` is deprecated and always empty (toasts live in `@sito/ui`).
 * `removeNotification(id?)` dismisses one toast, or all when `id` is omitted.
 * `showNotification` receives `NotificationType`.
 * `showSuccessNotification` and `showErrorNotification` receive `Partial<NotificationType>`.
 * `showStackNotifications` receives `NotificationType[]`.
 * @throws {Error} If used outside `NotificationProvider`.
 */
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);

  if (!context)
    throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
