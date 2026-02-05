import { MutationFunction, QueryKey } from "@tanstack/react-query";
import { DefaultValues, FieldValues } from "react-hook-form";

// @sito/dashboard
import { ActionType } from "@sito/dashboard";

// types
import {
  BaseEntityDto,
  ImportDto,
  ImportPreviewDto,
  ValidationError,
} from "lib";
import { UseConfirmationPropsType } from "../forms";
import { FormDialogPropsType, ImportDialogPropsType } from "components";

export interface UseDeleteDialogPropsType
  extends UseConfirmationPropsType<number, ValidationError> {
  queryKey: QueryKey;
}

export interface UseFormDialogPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
> {
  defaultValues?: DefaultValues<TFormType>;
  getFunction?: (id: number) => Promise<TDto>;
  formToDto: (data: TFormType) => TMutationDto;
  dtoToForm?: (data: TDto) => TFormType;
  mutationFn: MutationFunction<TMutationOutputDto, TMutationDto>;
  onError?: (errors: ValidationError) => void;
  onSuccess?: (data: TMutationOutputDto) => void;
  queryKey: QueryKey;
  onSuccessMessage: string;
  title: string;
}

export interface TriggerFormDialogPropsType<
  TFormType extends FieldValues,
  TError extends Error = Error,
> extends FormDialogPropsType<TFormType, TError> {
  openDialog: (id?: number) => void;
}

export interface UseActionDialog<
  TRow extends BaseEntityDto,
  TFormType extends FieldValues,
> extends TriggerFormDialogPropsType<TFormType, ValidationError> {
  action: (record: TRow) => ActionType<TRow>;
}

export type UseImportDialogPropsType<
  PreviewEntityDto extends ImportPreviewDto,
  EntityImportDto extends ImportDto<PreviewEntityDto>,
> = {
  queryKey: QueryKey;
  entity: string;
  mutationFn: MutationFunction<number, EntityImportDto>;
  fileProcessor?: (
    file: File,
    options?: { override?: boolean }
  ) => Promise<PreviewEntityDto[]>;
};

export type UseImportDialogReturnType<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
> = ImportDialogPropsType<PreviewEntityDto> & {
  action: () => ActionType<EntityDto>;
};
