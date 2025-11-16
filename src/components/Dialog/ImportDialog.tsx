import { useTranslation, FileInput } from "@sito/dashboard";

// components
import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

// types
import { ImportDialogPropsType } from "./types";

export const ImportDialog = (props: ImportDialogPropsType) => {
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
      {/* <FileInput
        label={t("_pages:common.actions.import.form.inputs.file.label")}
      /> */}
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
