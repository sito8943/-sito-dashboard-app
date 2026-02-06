import { useTranslation } from "@sito/dashboard";

// providers
import { queryClient, useNotification } from "providers";

// lib
import {
  NotificationEnumType,
  NotificationType,
  ValidationError,
  isValidationError,
  isHttpError,
} from "lib";

// hooks
import { useRestoreAction, useConfirmationForm } from "hooks";

// types
import { UseDeleteDialogPropsType } from "hooks";

export const useRestoreDialog = (props: UseDeleteDialogPropsType) => {
  const { queryKey, onSuccess, ...rest } = props;

  const { showStackNotifications } = useNotification();
  const { t } = useTranslation();

  const { open, onClick, close, dialogFn, isLoading } = useConfirmationForm<
    number,
    ValidationError
  >({
    onSuccessMessage: t("_pages:common.actions.restore.successMessage"),
    onError: (error: ValidationError) => {
      const unknownErr = error as unknown;
      if (isValidationError(unknownErr)) {
        showStackNotifications(
          unknownErr.errors.map(
            ([key, message]) =>
              ({
                message: t(`_pages:${key}.errors.${message}`),
                type: NotificationEnumType.error,
              }) as NotificationType
          )
        );
      } else if (isHttpError(unknownErr)) {
        const fallback = unknownErr.message || t("_accessibility:errors.500");
        const translated = t(`_accessibility:errors.${unknownErr.status}`);
        showStackNotifications([
          {
            message: translated || fallback,
            type: NotificationEnumType.error,
          } as NotificationType,
        ]);
      }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey });
      if (onSuccess) onSuccess(result);
    },
    ...rest,
  });

  const { action } = useRestoreAction({ onClick });

  return {
    onClick,
    title: t("_pages:common.actions.restore.dialog.title"),
    open,
    isLoading,
    handleSubmit: () => dialogFn.mutate(),
    handleClose: close,
    action,
  };
};
