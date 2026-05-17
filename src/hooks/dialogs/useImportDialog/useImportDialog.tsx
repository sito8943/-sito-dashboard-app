import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// @sito-dashboard
import { useTranslation } from "@sito/dashboard";

// lib
import { BaseEntityDto, HttpError, ImportDto, ImportPreviewDto } from "lib";

// hooks
import { useImportAction } from "hooks";

// types
import { UseImportDialogPropsType, UseImportDialogReturnType } from "./types";

// utils
import { createExtraSetter, resolveInitialExtra } from "./utils";

/**
 * Builds import dialog state and mutation flow for entity imports.
 * @param props - Import dialog configuration.
 * @returns Import dialog state, handlers and action factory.
 */
export function useImportDialog<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
  TExtra extends Record<string, unknown> = Record<string, never>,
>(
  props: UseImportDialogPropsType<PreviewEntityDto, TExtra>,
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
    defaultExtra,
    renderExtraFields,
  } = props;

  const initialExtra = resolveInitialExtra<TExtra>(defaultExtra);

  const [showDialog, setShowDialog] = useState(false);
  const [items, setItems] = useState<PreviewEntityDto[] | null>(null);
  const [override, setOverride] = useState<boolean>(false);
  const [extra, setExtra] = useState<TExtra>(initialExtra);

  const importMutation = useMutation<
    number,
    HttpError,
    ImportDto<PreviewEntityDto> & TExtra
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

  const setExtraValue = useMemo(() => createExtraSetter(setExtra), []);

  const extraFields = useMemo(
    () =>
      renderExtraFields?.({
        values: extra,
        setValue: setExtraValue,
        setValues: setExtra,
      }) ?? null,
    [renderExtraFields, extra, setExtraValue],
  );

  const resetState = useCallback(() => {
    setShowDialog(false);
    setItems(null);
    setOverride(false);
    setExtra(initialExtra);
  }, [initialExtra]);

  return {
    handleSubmit: async () => {
      if (!items || items.length === 0) return;
      try {
        await importMutation.mutateAsync({
          items,
          override,
          ...extra,
        } as ImportDto<PreviewEntityDto> & TExtra);
        resetState();
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
    handleClose: resetState,
    action,
    extraFields,
  };
}
