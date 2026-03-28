import { MutationFunction, QueryKey } from "@tanstack/react-query";
import {
  Control,
  DefaultValues,
  FieldValues,
  SubmitHandler,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form";

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
import { UseBaseFormProps, UseConfirmationPropsType } from "../forms";
import { FormDialogPropsType, ImportDialogPropsType } from "components";

export type FormDialogMode = "entity" | "state";

export type FormDialogFormToDtoContext = {
  id?: number;
};

/** @deprecated Use FormDialogFormToDtoContext. */
export type FormDialogMapOutContext = FormDialogFormToDtoContext;

export type FormDialogSubmitContext<TFormType extends FieldValues> = {
  close: () => void;
  id?: number;
  values: TFormType;
};

export type FormDialogErrorPhase = "submit" | "apply" | "clear";

export type FormDialogErrorContext<TFormType extends FieldValues> =
  FormDialogSubmitContext<TFormType> & {
    phase: FormDialogErrorPhase;
  };

export interface UseDeleteDialogPropsType
  extends UseConfirmationPropsType<number, ValidationError> {
  queryKey: QueryKey;
}

export interface UseFormDialogCoreBasePropsType<
  TFormType extends FieldValues,
  TMappedValues,
> {
  title: string;
  mode?: FormDialogMode;
  defaultValues?: DefaultValues<TFormType>;
  resetOnOpen?: boolean;
  reinitializeOnOpen?: boolean;
  closeOnSubmit?: boolean;
  dtoToForm?: () => DefaultValues<TFormType>;
  formToDto?: (
    data: TFormType,
    context: FormDialogFormToDtoContext,
  ) => TMappedValues;
  onSubmit?: (
    data: TMappedValues,
    context: FormDialogSubmitContext<TFormType>,
  ) => void | Promise<void>;
  onApply?: (
    data: TMappedValues,
    context: FormDialogSubmitContext<TFormType>,
  ) => void | Promise<void>;
  onClear?: () => void | Promise<void>;
  onError?: (
    error: unknown,
    context: FormDialogErrorContext<TFormType>,
  ) => void | Promise<void>;
}

export interface UseStateFormDialogPropsType<
  TFormType extends FieldValues,
  TMappedValues,
> extends UseFormDialogCoreBasePropsType<TFormType, TMappedValues> {
  mode: "state";
}

export interface UseEntityCoreFormDialogPropsType<
  TFormType extends FieldValues,
  TMappedValues,
> extends UseFormDialogCoreBasePropsType<TFormType, TMappedValues> {
  mode: "entity";
}

export type UseFormDialogCorePropsType<
  TFormType extends FieldValues,
  TMappedValues,
> =
  | UseStateFormDialogPropsType<TFormType, TMappedValues>
  | UseEntityCoreFormDialogPropsType<TFormType, TMappedValues>;

export type UseFormDialogPropsType<
  TFormType extends FieldValues,
  TMappedValues = TFormType,
> = UseFormDialogCorePropsType<TFormType, TMappedValues>;

export interface TriggerFormDialogPropsType<TFormType extends FieldValues>
  extends Omit<
    FormDialogPropsType<TFormType>,
    | "control"
    | "getValues"
    | "setValue"
    | "reset"
    | "setError"
    | "handleSubmit"
    | "onSubmit"
  > {
  openDialog: (params?: number | OpenFormDialogParamsType<TFormType>) => void;
  control: Control<TFormType, any, any>;
  getValues: UseFormGetValues<TFormType>;
  setValue: UseFormSetValue<TFormType>;
  reset: UseFormReset<TFormType>;
  setError: UseFormSetError<TFormType>;
  handleSubmit: UseFormHandleSubmit<TFormType, any>;
  onSubmit: SubmitHandler<TFormType>;
}

export interface OpenFormDialogParamsType<TFormType extends FieldValues> {
  id?: number;
  values?: DefaultValues<TFormType>;
}

export interface UseFormDialogReturnType<TFormType extends FieldValues>
  extends TriggerFormDialogPropsType<TFormType> {
  mode: FormDialogMode;
  id?: number;
  isSubmitting: boolean;
  onApply: () => Promise<void>;
  onClear: () => Promise<void>;
}

export interface UseActionDialog<
  TRow extends BaseEntityDto,
  TFormType extends FieldValues,
> extends TriggerFormDialogPropsType<TFormType> {
  action: (record: TRow) => ActionType<TRow>;
}

export interface UsePostDialogPropsType<
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
> extends UseBaseFormProps<TMutationOutputDto, Error>,
    Omit<
      UseEntityCoreFormDialogPropsType<TFormType, TMutationDto>,
      "mode" | "onSubmit" | "onError"
    > {
  mutationFn: MutationFunction<TMutationOutputDto, TMutationDto>;
  queryKey?: QueryKey;
}

export interface UsePutDialogPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
> extends Omit<
    UsePostDialogPropsType<TMutationDto, TMutationOutputDto, TFormType>,
    "dtoToForm" | "formToDto" | "mapOut"
  > {
  getFunction: (id: number) => Promise<TDto>;
  dtoToForm?: (data: TDto) => TFormType;
  formToDto?: (data: TFormType, dto?: TDto) => TMutationDto;
  /** @deprecated Use formToDto. */
  mapOut?: (data: TFormType, dto?: TDto) => TMutationDto;
}

export interface UseImportDialogPropsType<
  PreviewEntityDto extends ImportPreviewDto,
> extends UseBaseFormProps<PreviewEntityDto, HttpError> {
  queryKey: QueryKey;
  entity: string;
  mutationFn: MutationFunction<number, ImportDto<PreviewEntityDto>>;
  fileProcessor?: (
    file: File,
    options?: { override?: boolean },
  ) => Promise<PreviewEntityDto[]>;
  renderCustomPreview?: ImportDialogPropsType<PreviewEntityDto>["renderCustomPreview"];
}

export type UseImportDialogReturnType<
  EntityDto extends BaseEntityDto,
  PreviewEntityDto extends ImportPreviewDto,
> = ImportDialogPropsType<PreviewEntityDto> & {
  action: () => ActionType<EntityDto>;
};
