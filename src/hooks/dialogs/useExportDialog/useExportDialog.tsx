import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

// @sito-dashboard
import { useTranslation } from "@sito/dashboard";

// lib
import { BaseEntityDto, HttpError } from "lib";

// hooks
import { useExportAction } from "hooks";

// types
import { UseExportDialogPropsType, UseExportDialogReturnType } from "./types";

// utils
import { createExtraSetter, resolveInitialExtra } from "./utils";

/**
 * Builds export dialog state and mutation flow for entity exports that need
 * extra configuration (date range, format, columns, etc.) before triggering
 * the export.
 *
 * For entities that do not need extra configuration, use `useExportAction` +
 * `useExportActionMutate` directly. Both flows return an action descriptor
 * with the same shape, so `Page`/`Actions`/`PrettyGrid` can consume either.
 *
 * @param props - Export dialog configuration.
 * @returns Export dialog state, handlers and action factory.
 */
export function useExportDialog<
  EntityDto extends BaseEntityDto,
  TExtra extends Record<string, unknown> = Record<string, never>,
  TOutput = unknown,
>(
  props: UseExportDialogPropsType<TExtra, TOutput>,
): UseExportDialogReturnType<EntityDto> {
  const { t } = useTranslation();

  const {
    mutationFn,
    entity,
    onError,
    onSuccess,
    defaultExtra,
    renderExtraFields,
  } = props;

  const initialExtra = resolveInitialExtra<TExtra>(defaultExtra);

  const [showDialog, setShowDialog] = useState(false);
  const [extra, setExtra] = useState<TExtra>(initialExtra);

  const exportMutation = useMutation<TOutput, HttpError, TExtra>({
    mutationFn,
    onError: (error: HttpError) => {
      console.error(error);
      onError?.(error);
    },
    onSuccess: async (data) => {
      await onSuccess?.(data);
    },
  });

  const { action } = useExportAction({
    onClick: () => setShowDialog(true),
    isLoading: exportMutation.isPending,
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
    setExtra(initialExtra);
  }, [initialExtra]);

  return {
    handleSubmit: async () => {
      try {
        await exportMutation.mutateAsync(extra);
        resetState();
      } catch (e) {
        console.error(e);
      }
    },
    isLoading: exportMutation.isPending,
    open: showDialog,
    title: t("_pages:common.actions.export.dialog.title", {
      entity: t(`_pages:${entity}.title`),
      defaultValue: "Export",
    }),
    handleClose: resetState,
    action,
    extraFields,
  };
}
