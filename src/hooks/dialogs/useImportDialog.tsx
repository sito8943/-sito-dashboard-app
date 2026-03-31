import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// @sito-dashboard
import { useTranslation } from "@sito/dashboard";

// lib
import { BaseEntityDto, HttpError, ImportDto, ImportPreviewDto } from "lib";

// types
import { UseImportDialogPropsType, UseImportDialogReturnType } from "./types";

// hooks
import { useImportAction } from "hooks";

/** Builds import dialog state and mutation flow for entity imports. */
export function useImportDialog<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
>(
  props: UseImportDialogPropsType<PreviewEntityDto>,
): UseImportDialogReturnType<EntityDto, PreviewEntityDto> {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    queryKey,
    mutationFn,
    entity,
    fileProcessor,
    renderCustomPreview,
    onError,
  } = props;

  const [showDialog, setShowDialog] = useState(false);
  const [items, setItems] = useState<PreviewEntityDto[] | null>(null);
  const [override, setOverride] = useState<boolean>(false);

  const importMutation = useMutation<
    number,
    HttpError,
    ImportDto<PreviewEntityDto>
  >({
    mutationFn,
    onError: (error: HttpError) => {
      console.error(error);
      onError?.(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
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
        } as unknown as ImportDto<PreviewEntityDto>);
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
    renderCustomPreview,
    onOverrideChange: (value: boolean) => setOverride(value),
    open: showDialog,
    title: t("_pages:common.actions.import.dialog.title", {
      entity: t(`_pages:${entity}.title`),
    }),
    handleClose: () => {
      setShowDialog(false);
      setItems(null);
      setOverride(false);
    },
    action,
  };
}
