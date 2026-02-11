import { MutationFunction, QueryKey } from "@tanstack/react-query";
import { FieldValues, DefaultValues } from "react-hook-form";

export interface UseBaseFormProps<TInDto, TError extends Error> {
  onError?: (error: TError) => void;
  onSuccess?: (data: TInDto) => void | Promise<void>;
  onSuccessMessage?: string;
}

export interface UseConfirmationPropsType<TInDto, TError extends Error>
  extends UseBaseFormProps<TInDto, TError> {
  mutationFn: (data: TInDto[]) => Promise<TInDto>;
}

export interface UseFormPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
> extends UseBaseFormProps<TMutationOutputDto, Error> {
  defaultValues?: DefaultValues<TFormType>;
  getFunction?: (id: number) => Promise<TDto>;
  formToDto?: (data: TFormType) => TMutationDto;
  dtoToForm?: (data: TDto) => TFormType;
  mutationFn: MutationFunction<TMutationOutputDto, TMutationDto>;
  queryKey: QueryKey;
}
