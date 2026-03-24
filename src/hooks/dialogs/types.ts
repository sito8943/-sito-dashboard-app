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
import {
  UseBaseFormProps,
  UseConfirmationPropsType,
  UseFormPropsType,
} from "../forms";
import { FormDialogPropsType, ImportDialogPropsType } from "components";

export type FormDialogMode = "entity" | "state";

export type FormDialogMapOutContext = {
  id?: number;
};

export type FormDialogSubmitContext<TFormType extends FieldValues> = {
  close: () => void;
  id?: number;
  values: TFormType;
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
  mapIn?: () => DefaultValues<TFormType>;
  mapOut?: (data: TFormType, context: FormDialogMapOutContext) => TMappedValues;
  onSubmit?: (
    data: TMappedValues,
    context: FormDialogSubmitContext<TFormType>,
  ) => void | Promise<void>;
  onApply?: (
    data: TMappedValues,
    context: FormDialogSubmitContext<TFormType>,
  ) => void | Promise<void>;
  onClear?: () => void | Promise<void>;
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

export interface UseFormDialogLegacyPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
> extends UseFormPropsType<TDto, TMutationDto, TMutationOutputDto, TFormType> {
  title: string;
}

export type UseFormDialogCorePropsType<
  TFormType extends FieldValues,
  TMappedValues,
> =
  | UseStateFormDialogPropsType<TFormType, TMappedValues>
  | UseEntityCoreFormDialogPropsType<TFormType, TMappedValues>;

export type UseFormDialogPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
  TMappedValues = TFormType,
> =
  | UseFormDialogLegacyPropsType<
      TDto,
      TMutationDto,
      TMutationOutputDto,
      TFormType
    >
  | UseFormDialogCorePropsType<TFormType, TMappedValues>;

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
  control: Control<TFormType, any, any>;
  getValues: UseFormGetValues<TFormType>;
  setValue: UseFormSetValue<TFormType>;
  reset: UseFormReset<TFormType>;
  setError: UseFormSetError<TFormType>;
  handleSubmit: UseFormHandleSubmit<TFormType, any>;
  onSubmit: SubmitHandler<TFormType>;
  openDialog: (id?: number) => void;
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
      "mode" | "onSubmit"
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
    "mapOut"
  > {
  getFunction: (id: number) => Promise<TDto>;
  dtoToForm?: (data: TDto) => TFormType;
  mapOut?: (data: TFormType, dto?: TDto) => TMutationDto;
}

export type UseEntityFormDialogPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType extends FieldValues,
> = UseFormDialogLegacyPropsType<
  TDto,
  TMutationDto,
  TMutationOutputDto,
  TFormType
>;

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
