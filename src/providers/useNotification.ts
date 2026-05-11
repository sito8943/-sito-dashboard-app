import { useContext } from "react";

import type { NotificationContextType } from "./types";
import { NotificationContext } from "./NotificationContext";

/**
 * Hook to consume the notification context.
 *
 * @returns {NotificationContextType} Notification state and helper methods.
 * `notification` is `NotificationType[]`.
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
