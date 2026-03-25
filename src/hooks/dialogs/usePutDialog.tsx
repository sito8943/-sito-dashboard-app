import { useEffect, useRef } from "react";
import { FieldValues } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useFormDialog } from "./useFormDialog";
import { UseFormDialogReturnType, UsePutDialogPropsType } from "./types";

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
  const lastHydratedDataRef = useRef<TDto>();

  const {
    mutationFn,
    queryKey,
    onSuccess,
    onError,
    mapOut,
    getFunction,
    dtoToForm,
    title,
    ...coreProps
  } = props;
  const dtoToFormRef = useRef(dtoToForm);

  useEffect(() => {
    dtoToFormRef.current = dtoToForm;
  }, [dtoToForm]);

  const dialogFn = useMutation<TMutationOutputDto, Error, TMutationDto>({
    mutationFn,
  });

  const dialog = useFormDialog<never, never, never, TFormType, TMutationDto>({
    ...coreProps,
    mode: "entity",
    title,
    onSubmit: async (payload) => {
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
    mapOut: (data) => {
      if (mapOut) return mapOut(data, entityRef.current);
      return data as unknown as TMutationDto;
    },
  });
  const { reset: resetForm } = dialog;

  const resolveQueryKey = queryKey || ["put-dialog", title];

  const getByIdQuery = useQuery({
    queryFn: () => getFunction(dialog.id as number),
    queryKey: [...resolveQueryKey, dialog.id],
    enabled: dialog.open && !!dialog.id,
  });

  useEffect(() => {
    if (!getByIdQuery.data) return;
    if (lastHydratedDataRef.current === getByIdQuery.data) return;

    entityRef.current = getByIdQuery.data;
    lastHydratedDataRef.current = getByIdQuery.data;

    if (dtoToFormRef.current && resetForm) {
      resetForm(dtoToFormRef.current(getByIdQuery.data));
      return;
    }

    resetForm?.(getByIdQuery.data as unknown as TFormType);
  }, [getByIdQuery.data, resetForm]);

  return {
    ...dialog,
    isLoading:
      dialog.isLoading ||
      dialogFn.isPending ||
      getByIdQuery.isFetching ||
      getByIdQuery.isLoading,
  };
};
