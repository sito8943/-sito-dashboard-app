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
} from "lib";

// providers
import { queryClient } from "providers";

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

  const { queryKey, mutationFn, entity, fileProcessor } = props;

  const [showDialog, setShowDialog] = useState(false);
  const [items, setItems] = useState<PreviewEntityDto[] | null>(null);
  const [override, setOverride] = useState<boolean>(false);

  const importMutation = useMutation<number, ValidationError, EntityImportDto>({
    mutationFn,
    onError: (error: ValidationError) => {
      console.error(error);
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
