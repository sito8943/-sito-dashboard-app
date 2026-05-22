import { useCallback, useEffect, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useFormDialog } from "./useFormDialog";
import { useFormDialogConfirmation } from "./useFormDialogConfirmation";
import { UseFormDialogReturnType, UsePutDialogPropsType } from "./types";

/**
 * Creates an edit dialog with get-by-id hydration and update mutation flow.
 * @param props - Put dialog configuration.
 * @returns Form dialog state and handlers.
 */
export const usePutDialog = <
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
>(
  props: UsePutDialogPropsType<
    TDto,
    TMutationDto,
    TMutationOutputDto,
    TFormType
  >,
): UseFormDialogReturnType<TFormType> => {
  const queryClient = useQueryClient();
  const entityRef = useRef<TDto>();

  const {
    mutationFn,
    queryKey,
    onSuccess,
    onError,
    formToDto,
    getFunction,
    dtoToForm,
    title,
    confirmation,
    closeOnSubmit,
    ...coreProps
  } = props;
  const dtoToFormRef = useRef(dtoToForm);

  useEffect(() => {
    dtoToFormRef.current = dtoToForm;
  }, [dtoToForm]);

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
        if (onError) onError(error as Error);
        throw error;
      }
    },
    [dialogFn, onError, onSuccess, queryClient, queryKey],
  );

  const formCloseRef = useRef<() => void>();

  const confirmationFlow = useFormDialogConfirmation<TMutationDto>({
    confirmation,
    runMutation,
    onConfirmed: () => formCloseRef.current?.(),
    isMutating: dialogFn.isPending,
  });

  const dialog = useFormDialog<TFormType, TMutationDto>({
    ...coreProps,
    mode: "entity",
    title,
    closeOnSubmit: confirmation ? false : closeOnSubmit,
    onSubmit: async (payload) => {
      if (confirmation) {
        confirmationFlow.capture(payload);
        return;
      }
      await runMutation(payload);
    },
    formToDto: (data) => {
      const formToDtoMapper = formToDto;
      if (formToDtoMapper) return formToDtoMapper(data, entityRef.current);
      return data as unknown as TMutationDto;
    },
  });

  useEffect(() => {
    formCloseRef.current = dialog.handleClose;
  }, [dialog.handleClose]);

  const { reset: resetForm } = dialog;

  const resolveQueryKey = queryKey || ["put-dialog", title];
  const hasDialogId = typeof dialog.id === "number";

  const getByIdQuery = useQuery({
    queryFn: () => getFunction(dialog.id as number),
    queryKey: [...resolveQueryKey, dialog.id],
    enabled: dialog.open && hasDialogId,
  });

  useEffect(() => {
    if (!dialog.open || !getByIdQuery.data) return;

    entityRef.current = getByIdQuery.data;

    if (dtoToFormRef.current && resetForm) {
      resetForm(dtoToFormRef.current(getByIdQuery.data));
      return;
    }

    resetForm?.(getByIdQuery.data as unknown as TFormType);
  }, [dialog.open, getByIdQuery.data, resetForm]);

  useEffect(() => {
    if (dialog.open) return;
    entityRef.current = undefined;
  }, [dialog.open]);

  return {
    ...dialog,
    isLoading:
      dialog.isLoading ||
      dialogFn.isPending ||
      getByIdQuery.isFetching ||
      getByIdQuery.isLoading,
    confirmationProps: confirmationFlow.confirmationProps,
  };
};
