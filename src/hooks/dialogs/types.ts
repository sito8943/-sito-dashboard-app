import { MutationFunction, QueryKey } from "@tanstack/react-query";
import { FieldValues } from "react-hook-form";

// @sito/dashboard
import { ActionType } from "@sito/dashboard";

// types
import {
  BaseEntityDto,
  HttpError,
  ImportDto,
  ImportPreviewDto,
  ValidationError,
} from "lib";
import {
  UseBaseFormProps,
  UseConfirmationPropsType,
  UseFormPropsType,
} from "../forms";
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
> extends UseFormPropsType<TDto, TMutationDto, TMutationOutputDto, TFormType> {
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

export interface UseImportDialogPropsType<
  PreviewEntityDto extends ImportPreviewDto,
> extends UseBaseFormProps<PreviewEntityDto, HttpError> {
  queryKey: QueryKey;
  entity: string;
  mutationFn: MutationFunction<number, ImportDto<PreviewEntityDto>>;
  fileProcessor?: (
    file: File,
    options?: { override?: boolean }
  ) => Promise<PreviewEntityDto[]>;
}

export type UseImportDialogReturnType<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
> = ImportDialogPropsType<PreviewEntityDto> & {
  action: () => ActionType<EntityDto>;
};
