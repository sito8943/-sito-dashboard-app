import { ReactNode } from "react";

// components
import { ButtonPropsType, DialogPropsType } from "components";

export interface ExportDialogPropsType extends Omit<
  DialogPropsType,
  "onSubmit"
> {
  handleSubmit: () => void;
  isLoading?: boolean;
  extraFields?: ReactNode;
  extraActions?: ButtonPropsType[];
}
