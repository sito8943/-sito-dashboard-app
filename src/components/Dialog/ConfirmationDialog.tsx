import { useTranslation } from "@sito/dashboard";

// @sito/dashboard

// components
import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

// types
import { ConfirmationDialogPropsType } from "./types";

// styles
import "./styles.css";

export const ConfirmationDialog = (props: ConfirmationDialogPropsType) => {
  const { t } = useTranslation();

  const {
    children,
    handleSubmit,
    handleClose,
    isLoading = false,
    ...rest
  } = props;

  return (
    <Dialog {...rest} handleClose={handleClose}>
      {children}
      <DialogActions
        primaryText={t("_accessibility:buttons.ok")}
        cancelText={t("_accessibility:buttons.cancel")}
        onPrimaryClick={handleSubmit}
        onCancel={handleClose}
        isLoading={isLoading}
        disabled={isLoading}
        primaryType="button"
        containerClassName="mt-5"
        primaryName={t("_accessibility:buttons.ok")}
        primaryAriaLabel={t("_accessibility:ariaLabels.ok")}
        cancelName={t("_accessibility:buttons.cancel")}
        cancelAriaLabel={t("_accessibility:ariaLabels.cancel")}
      />
    </Dialog>
  );
};
