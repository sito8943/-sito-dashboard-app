import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

// @sito/dashboard
import { useTranslation } from "@sito/dashboard";

// lib
import {
  BaseEntityDto,
  ImportPreviewDto,
  ImportDto,
  ValidationError,
  isHttpError,
  isValidationError,
  NotificationEnumType,
  NotificationType,
} from "lib";

// providers
import { queryClient, useNotification } from "providers";

// types
import { UseImportDialogPropsType, UseImportDialogReturnType } from "./types";

// hooks
import { useImportAction } from "hooks";

export function useImportDialog<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
  EntityImportDto extends ImportDto<PreviewEntityDto>,
>(
  props: UseImportDialogPropsType<PreviewEntityDto, EntityImportDto>
): UseImportDialogReturnType<EntityDto, PreviewEntityDto> {
  const { t } = useTranslation();
  const { showStackNotifications } = useNotification();

  const { queryKey, mutationFn, entity, fileProcessor } = props;

  const [showDialog, setShowDialog] = useState(false);
  const [items, setItems] = useState<PreviewEntityDto[] | null>(null);
  const [override, setOverride] = useState<boolean>(false);

  const importMutation = useMutation<number, ValidationError, EntityImportDto>({
    mutationFn,
    onError: (error: ValidationError) => {
      console.error(error);
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
    onSuccess: async () => {
      if (queryClient) await queryClient.invalidateQueries({ queryKey });
    },
  });

  const { action } = useImportAction({
    onClick: () => setShowDialog(true),
  });

  return {
    handleSubmit: async () => {
      if (!items || items.length === 0) return;
      try {
        await importMutation.mutateAsync({
          items,
          override,
        } as unknown as EntityImportDto);
        setShowDialog(false);
        setItems(null);
        setOverride(false);
      } catch (e) {
        console.error(e);
      }
    },
    isLoading: importMutation.isPending,
    fileProcessor,
    onFileProcessed: (parsed: PreviewEntityDto[]) => setItems(parsed),
    onOverrideChange: (value: boolean) => setOverride(value),
    open: showDialog,
    title: t("_pages:common.actions.import.dialog.title", {
      entity: t(`_pages:${entity}.title`),
    }),
    handleClose: () => {
      setShowDialog(false);
      setItems(null);
    },
    action,
  };
}
