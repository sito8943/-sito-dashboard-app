import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

// form
import { FormContainerPropsType } from "../Form";
import { ButtonPropsType } from "components";

export type DialogPropsType = {
  open?: boolean;
  title: string;
  children?: ReactNode;
  handleClose: () => void;
  containerClassName?: string;
  className?: string;
  animationClass?: string;
};

export interface ConfirmationDialogPropsType extends DialogPropsType {
  handleSubmit: () => void;
  isLoading?: boolean;
  extraActions?: ButtonPropsType[];
}

export interface FormDialogPropsType<TFormType extends FieldValues>
  extends DialogPropsType,
    Omit<FormContainerPropsType<TFormType>, "children"> {
  extraActions?: ButtonPropsType[];
}

export type DialogActionsProps = {
  primaryText: string;
  cancelText: string;
  onPrimaryClick?: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  primaryType?: "button" | "submit";
  containerClassName?: string;
  primaryClassName?: string;
  alignEnd?: boolean;
  primaryName?: string;
  primaryAriaLabel?: string;
  cancelName?: string;
  cancelAriaLabel?: string;
  extraActions?: ButtonPropsType[];
};
