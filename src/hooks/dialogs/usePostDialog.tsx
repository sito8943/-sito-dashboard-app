import { useCallback, useEffect, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useFormDialog } from "./useFormDialog";
import { useFormDialogConfirmation } from "./useFormDialogConfirmation";
import { useDialogErrorNotification } from "./useDialogErrorNotification";
import { UseFormDialogReturnType, UsePostDialogPropsType } from "./types";

/**
 * Creates a form dialog wired to a create mutation and cache invalidation.
 * @param props - Post dialog configuration.
 * @returns Form dialog state and handlers.
 */
export const usePostDialog = <
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
>(
  props: UsePostDialogPropsType<TMutationDto, TMutationOutputDto, TFormType>,
): UseFormDialogReturnType<TFormType> => {
  const queryClient = useQueryClient();
  const {
    mutationFn,
    queryKey,
    onSuccess,
    onError,
    formToDto,
    confirmation,
    closeOnSubmit,
    ...coreProps
  } = props;

  const notifyError = useDialogErrorNotification();
  const handleError = onError ?? notifyError;

  const dialogFn = useMutation<TMutationOutputDto, Error, TMutationDto>({
    mutationFn,
  });

  const runMutation = useCallback(
    async (payload: TMutationDto) => {
      try {
        const result = await dialogFn.mutateAsync(payload);
        if (queryKey) {
          await queryClient.invalidateQueries({ queryKey });
        }
        if (onSuccess) {
          await onSuccess(result);
        }
      } catch (error) {
        handleError(error as Error);
        throw error;
      }
    },
    [dialogFn, handleError, onSuccess, queryClient, queryKey],
  );

  const formCloseRef = useRef<(() => void) | undefined>(undefined);

  const confirmationFlow = useFormDialogConfirmation<TMutationDto>({
    confirmation,
    runMutation,
    onConfirmed: () => formCloseRef.current?.(),
    isMutating: dialogFn.isPending,
  });

  const dialog = useFormDialog<TFormType, TMutationDto>({
    ...coreProps,
    mode: "entity",
    formToDto: formToDto,
    closeOnSubmit: confirmation ? false : closeOnSubmit,
    onSubmit: async (payload) => {
      if (confirmation) {
        confirmationFlow.capture(payload);
        return;
      }
      await runMutation(payload);
    },
  });

  useEffect(() => {
    formCloseRef.current = dialog.handleClose;
  }, [dialog.handleClose]);

  return {
    ...dialog,
    confirmationProps: confirmationFlow.confirmationProps,
  };
};
