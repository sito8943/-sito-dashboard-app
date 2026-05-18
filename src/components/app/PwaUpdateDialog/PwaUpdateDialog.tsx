import { Button } from "../../ui/Buttons";
import { Dialog } from "../../ui/Dialog";

import { PwaUpdateDialogPropsType } from "./types";

/**
 * Presentational PWA update dialog. Source of `needRefresh` and update fn
 * stays in the consumer (custom SW hook, `vite-plugin-pwa`, etc.).
 */
export const PwaUpdateDialog = (props: PwaUpdateDialogPropsType) => {
  const {
    open,
    onDismiss,
    onUpdate,
    title,
    description,
    dismissLabel,
    updateLabel,
    mobileFullScreen = false,
    containerClassName = "!items-end pb-3",
  } = props;

  return (
    <Dialog
      open={open}
      title={title}
      handleClose={onDismiss}
      mobileFullScreen={mobileFullScreen}
      containerClassName={containerClassName}
    >
      <p className="text-sm text-text-muted">{description}</p>
      <div className="mt-5 flex items-center justify-end gap-2">
        <Button type="button" variant="outlined" onClick={onDismiss}>
          {dismissLabel}
        </Button>
        <Button
          type="button"
          variant="submit"
          color="primary"
          onClick={onUpdate}
        >
          {updateLabel}
        </Button>
      </div>
    </Dialog>
  );
};
