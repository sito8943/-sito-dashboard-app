import { ReactNode } from "react";

// components
import { ButtonPropsType, DialogPropsType } from "components";

export interface ExportDialogPropsType extends DialogPropsType {
  handleSubmit: () => void;
  isLoading?: boolean;
  extraFields?: ReactNode;
  extraActions?: ButtonPropsType[];
}
