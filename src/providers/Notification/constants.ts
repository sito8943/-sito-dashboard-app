import { TOAST_PLACEMENTS, TOAST_VARIANTS } from "@sito/ui";

// lib
import type { NotificationType } from "@/lib";

/** Default toast position. Matches the bottom-left corner of the old portal. */
export const DEFAULT_NOTIFICATION_PLACEMENT = TOAST_PLACEMENTS.BOTTOM_LEFT;

/** Default toast variant. `filled` keeps the solid status backgrounds. */
export const DEFAULT_NOTIFICATION_VARIANT = TOAST_VARIANTS.FILLED;

/** Default number of visible toasts; the oldest leaves first. */
export const DEFAULT_NOTIFICATION_MAX = 3;

/** i18n key for the accessible name of the toast region. */
export const NOTIFICATION_REGION_LABEL_KEY =
  "_accessibility:labels.notifications";

/** i18n key for the accessible name of each toast's close button. */
export const NOTIFICATION_CLOSE_LABEL_KEY =
  "_accessibility:ariaLabels.closeNotification";

/** Fallback labels when no `TranslationProvider` is mounted above. */
export const NOTIFICATION_FALLBACK_LABELS = {
  label: "Notifications",
  closeLabel: "Close notification",
} as const;

/**
 * Stable empty list returned by the deprecated `notification` field. Toasts
 * live in `@sito/ui`, which does not report auto-dismissals back.
 */
export const NO_NOTIFICATIONS: NotificationType[] = [];
