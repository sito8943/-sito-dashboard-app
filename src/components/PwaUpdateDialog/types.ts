export type PwaUpdateDialogPropsType = {
  open: boolean;
  onDismiss: () => void;
  onUpdate: () => void;
  title: string;
  description: string;
  dismissLabel: string;
  updateLabel: string;
  mobileFullScreen?: boolean;
  containerClassName?: string;
};
