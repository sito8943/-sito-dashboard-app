import { Button } from "../../ui/Buttons";
import { Dialog } from "../../ui/Dialog";

import { PwaUpdateDialogPropsType } from "./types";

import "./styles.css";

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
    initialFocus,
    mobileFullScreen = false,
    containerClassName = "pwa-update-dialog-container",
  } = props;

  return (
    <Dialog
      open={open}
      title={title}
      handleClose={onDismiss}
      initialFocus={initialFocus}
      mobileFullScreen={mobileFullScreen}
      containerClassName={containerClassName}
    >
      <p className="pwa-update-dialog-description">{description}</p>
      <div className="pwa-update-dialog-actions">
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
