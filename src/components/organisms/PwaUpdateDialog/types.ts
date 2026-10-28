import type { DialogInitialFocusTarget } from "@/components/organisms/Dialog";

export type PwaUpdateDialogPropsType = {
  open: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
  title: string;
  description: string;
  dismissLabel: string;
  updateLabel: string;
  initialFocus?: DialogInitialFocusTarget;
  mobileFullScreen?: boolean;
  containerClassName?: string;
};
