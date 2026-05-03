import { TextInputPropsType } from "@sito/dashboard";
import { DetailedHTMLProps, ReactNode, TextareaHTMLAttributes } from "react";
import {
  Control,
  FieldValues,
  SubmitHandler,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form";

export interface ParagraphInputPropsType
  extends Pick<
      TextInputPropsType,
      | "label"
      | "state"
      | "containerClassName"
      | "inputClassName"
      | "labelClassName"
      | "helperText"
      | "helperTextClassName"
    >,
    DetailedHTMLProps<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    > {}

export type FormContainerRenderActionsContextType = {
  isLoading: boolean;
  submitDisabled: boolean;
  cancelDisabled: boolean;
  submitLabel: ReactNode;
  cancelLabel: ReactNode;
  onCancel: () => void;
  submitAriaLabel: string;
  cancelAriaLabel: string;
  submitName: string;
  cancelName: string;
  defaultActions: ReactNode;
  buttonProps: {
    submit: {
      type: "submit";
      disabled: boolean;
      name: string;
      "aria-label": string;
    };
    cancel: {
      type: "button";
      disabled: boolean;
      name: string;
      "aria-label": string;
    };
  };
};

export type FormContainerPropsType<TFormType extends FieldValues> = {
  children: ReactNode;
  control?: Control<TFormType>;
  getValues?: UseFormGetValues<TFormType>;
  setValue?: UseFormSetValue<TFormType>;
  reset?: UseFormReset<TFormType>;
  setError?: UseFormSetError<TFormType>;
  handleSubmit: UseFormHandleSubmit<TFormType>;
  onSubmit: SubmitHandler<TFormType>;
  /* if the buttons are aligned to the end */
  buttonEnd?: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
  submitLabel?: ReactNode;
  cancelLabel?: ReactNode;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  actionsClassName?: string;
  renderActions?: (context: FormContainerRenderActionsContextType) => ReactNode;
};

export type FormPropsType<TFormType extends FieldValues> = Omit<
  FormContainerPropsType<TFormType>,
  "children"
>;
