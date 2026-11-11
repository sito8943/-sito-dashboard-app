import { useTranslation } from "@sito/dashboard";

import {
  NOTIFICATION_CLOSE_LABEL_KEY,
  NOTIFICATION_FALLBACK_LABELS,
  NOTIFICATION_REGION_LABEL_KEY,
} from "./constants";
import type { NotificationLabels, NotificationToastOptions } from "./types";

/**
 * Resolves the toast region and close-button labels. Explicit props win; then
 * the translated keys; then English fallbacks. `NotificationProvider` may sit
 * outside `TranslationProvider` (e.g. `AppProviders` wrapping it), and
 * `useTranslation` throws there, so the error is caught. The hook order stays
 * the same either way: `useTranslation` always calls `useContext` first.
 * @param props - Explicit `label` / `closeLabel`.
 * @returns Labels for `ToastProvider`.
 */
export const useNotificationLabels = (
  props: Pick<NotificationToastOptions, "label" | "closeLabel">,
): NotificationLabels => {
  let t: ((key: string) => string) | undefined;
  try {
    t = useTranslation().t;
  } catch {
    t = undefined;
  }

  return {
    label:
      props.label ??
      t?.(NOTIFICATION_REGION_LABEL_KEY) ??
      NOTIFICATION_FALLBACK_LABELS.label,
    closeLabel:
      props.closeLabel ??
      t?.(NOTIFICATION_CLOSE_LABEL_KEY) ??
      NOTIFICATION_FALLBACK_LABELS.closeLabel,
  };
};
