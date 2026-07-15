import { BaseSyntheticEvent, ReactNode } from "react";
import { FieldValues } from "react-hook-form";

// form
import { FormContainerPropsType } from "../Form";

// types
import { ButtonPropsType } from "components";

export type DialogSubmitHandler = (
  event?: BaseSyntheticEvent,
) => void | Promise<void>;

export type DialogInitialFocusTarget = "first-input" | "submit";

export type DialogPropsType = {
  /**
   * Optional DOM id. When set, the inner dialog element receives this id
   * and the backdrop element receives `backdrop-${dialogId}`, so both can be
   * located quickly in the DOM (e.g. for stacking or testing).
   * Named `dialogId` to avoid clashing with the entity `id` carried by forms.
   */
  dialogId?: string;
  open?: boolean;
  title: string;
  children?: ReactNode;
  handleClose: () => void;
  initialFocus?: DialogInitialFocusTarget;
  closeOnBackdropClick?: boolean;
  onSubmit?: DialogSubmitHandler;
  mobileFullScreen?: boolean;
  containerClassName?: string;
  className?: string;
  animationClass?: string;
};

export interface ConfirmationDialogPropsType extends Omit<
  DialogPropsType,
  "onSubmit"
> {
  handleSubmit: () => void;
  isLoading?: boolean;
  extraActions?: ButtonPropsType[];
}

export interface FormDialogPropsType<TFormType extends FieldValues>
  extends
    Omit<DialogPropsType, "onSubmit">,
    Omit<
      FormContainerPropsType<TFormType>,
      | "children"
      | "onCancel"
      | "submitLabel"
      | "cancelLabel"
      | "submitDisabled"
      | "cancelDisabled"
      | "actionsClassName"
      | "renderActions"
    > {
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
