import { useTranslation } from "@sito/dashboard";

// components
import { Dialog, DialogActions } from "components";

// types
import { ExportDialogPropsType } from "./types";

/**
 * Renders an export dialog that collects extra configuration before triggering
 * the export mutation.
 * @param props - Export dialog props.
 * @returns Export dialog element.
 */
export const ExportDialog = (props: ExportDialogPropsType) => {
  const { t } = useTranslation();

  const {
    children,
    handleSubmit,
    handleClose,
    isLoading = false,
    extraFields,
    extraActions = [],
    ...rest
  } = props;

  return (
    <Dialog {...rest} handleClose={handleClose} onSubmit={handleSubmit}>
      {children}
      {extraFields}
      <DialogActions
        primaryText={t("_accessibility:buttons.ok")}
        cancelText={t("_accessibility:buttons.cancel")}
        onCancel={handleClose}
        isLoading={isLoading}
        disabled={isLoading}
        primaryType="submit"
        containerClassName="mt-5"
        primaryName={t("_accessibility:buttons.ok")}
        primaryAriaLabel={t("_accessibility:ariaLabels.ok")}
        cancelName={t("_accessibility:buttons.cancel")}
        cancelAriaLabel={t("_accessibility:ariaLabels.cancel")}
        extraActions={extraActions}
      />
    </Dialog>
  );
};
