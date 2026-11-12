import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { TOAST_COLORS, type ToastColor } from "@sito/ui";

// lib
import { NotificationEnumType } from "@/lib";

/**
 * Resolves the notification type. A missing type is an error, as before.
 * @param type - Notification type.
 * @returns The resolved type.
 */
export const resolveNotificationType = (
  type?: NotificationEnumType,
): NotificationEnumType => type ?? NotificationEnumType.error;

/**
 * Maps a notification type to the `@sito/ui` toast color.
 * @param type - Notification type (missing means error).
 * @returns Toast color.
 */
export const toToastColor = (type?: NotificationEnumType): ToastColor => {
  switch (resolveNotificationType(type)) {
    case NotificationEnumType.success:
      return TOAST_COLORS.SUCCESS;
    case NotificationEnumType.warning:
      return TOAST_COLORS.WARNING;
    case NotificationEnumType.info:
      return TOAST_COLORS.INFO;
    default:
      return TOAST_COLORS.ERROR;
  }
};

/**
 * Picks the toast icon for a notification type.
 * @param type - Notification type (missing means error).
 * @returns FontAwesome icon.
 */
export const getNotificationIcon = (
  type?: NotificationEnumType,
): IconDefinition => {
  switch (resolveNotificationType(type)) {
    case NotificationEnumType.success:
      return faCircleCheck;
    case NotificationEnumType.info:
      return faCircleInfo;
    default:
      return faTriangleExclamation;
  }
};

/**
 * Builds the `@sito/ui` toast id for a notification id.
 * @param prefix - Provider-scoped prefix.
 * @param id - Notification id.
 * @returns Toast id.
 */
export const toToastId = (prefix: string, id: number) => `${prefix}-${id}`;
