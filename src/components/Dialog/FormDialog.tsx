import { useTranslation } from "@sito/dashboard";
import { FieldValues } from "react-hook-form";

// components
import { Dialog } from "./Dialog";
import { DialogActions } from "./DialogActions";

// types
import { FormDialogPropsType } from "./types";

// styles
import "./styles.css";

export const FormDialog = <TInput extends FieldValues, TError extends Error>(
  props: FormDialogPropsType<TInput, TError>
) => {
  const { t } = useTranslation();
  const {
    children,
    handleSubmit,
    onSubmit,
    handleClose,
    isLoading = false,
    buttonEnd = true,
    ...rest
  } = props;

  return (
    <Dialog {...rest} handleClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-container">{children}</div>
        <DialogActions
          primaryType="submit"
          primaryText={t("_accessibility:buttons.submit")}
          cancelText={t("_accessibility:buttons.cancel")}
          onCancel={handleClose}
          isLoading={isLoading}
          disabled={isLoading}
          primaryClassName="!px-6"
          alignEnd={buttonEnd}
          primaryName={t("_accessibility:buttons.submit")}
          primaryAriaLabel={t("_accessibility:ariaLabels.submit")}
          cancelName={t("_accessibility:buttons.cancel")}
          cancelAriaLabel={t("_accessibility:ariaLabels.cancel")}
        />
      </form>
    </Dialog>
  );
};
