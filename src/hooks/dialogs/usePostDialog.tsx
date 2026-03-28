import { FieldValues } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useFormDialog } from "./useFormDialog";
import { UseFormDialogReturnType, UsePostDialogPropsType } from "./types";

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
    mapOut,
    ...coreProps
  } = props;

  const dialogFn = useMutation<TMutationOutputDto, Error, TMutationDto>({
    mutationFn,
  });

  return useFormDialog<TFormType, TMutationDto>({
    ...coreProps,
    mode: "entity",
    formToDto: formToDto || mapOut,
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
  });
};
