import { useCallback } from "react";
import { useTranslation } from "@sito/dashboard";

// providers
import { useNotification } from "providers";

// lib
import {
  NotificationEnumType,
  NotificationType,
  isHttpError,
  isValidationError,
} from "lib";

/**
 * Builds the default dialog error handler that surfaces validation and HTTP
 * errors as notifications. Used by `usePostDialog`/`usePutDialog` when the
 * caller does not provide its own `onError`, so failed mutations are never
 * swallowed silently. Callers can override it by passing `onError`.
 * @returns A stable error handler.
 */
export const useDialogErrorNotification = (): ((error: Error) => void) => {
  const { t } = useTranslation();
  const { showStackNotifications, showErrorNotification } = useNotification();

  return useCallback(
    (error: Error) => {
      console.error(error);

      if (isValidationError(error)) {
        showStackNotifications(
          error.errors.map(
            ([key, message]) =>
              ({
                message: t(`_entities:${key}.${message}`),
                type: NotificationEnumType.error,
              }) as NotificationType,
          ),
        );
      } else if (isHttpError(error)) {
        const fallback = error.message || t("_accessibility:errors.500");
        const translated = t(`_accessibility:errors.${error.status}`);
        showErrorNotification({ message: translated || fallback });
      } else {
        showErrorNotification({ message: t("_accessibility:errors.500") });
      }
    },
    [t, showStackNotifications, showErrorNotification],
  );
};
