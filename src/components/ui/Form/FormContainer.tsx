import { FieldValues } from "react-hook-form";

// @sito/dashboard
import { useTranslation, Loading, classNames } from "@sito/dashboard";

// components
import { Button } from "components";

// types
import { FormContainerPropsType } from "./types";

// styles
import "./styles.css";

/**
 * Wraps form content and renders default submit/cancel actions.
 * @param props - Form container props.
 * @returns Form element with default action buttons.
 */
export const FormContainer = <TInput extends FieldValues>(
  props: FormContainerPropsType<TInput>,
) => {
  const { t } = useTranslation();
  const {
    children,
    handleSubmit,
    onSubmit,
    isLoading = false,
    buttonEnd = true,
    reset,
    onCancel,
    submitLabel,
    cancelLabel,
    submitDisabled,
    cancelDisabled,
    actionsClassName,
    renderActions,
  } = props;

  const resolvedSubmitLabel = submitLabel ?? t("_accessibility:buttons.submit");
  const resolvedCancelLabel = cancelLabel ?? t("_accessibility:buttons.cancel");
  const resolvedSubmitDisabled = submitDisabled ?? isLoading;
  const resolvedCancelDisabled = cancelDisabled ?? false;
  const submitAriaLabel = t("_accessibility:ariaLabels.submit");
  const cancelAriaLabel = t("_accessibility:ariaLabels.cancel");
  const submitName = t("_accessibility:buttons.submit");
  const cancelName = t("_accessibility:buttons.cancel");
  const handleCancel = () => {
    if (onCancel) onCancel();
    else reset?.();
  };

  const defaultActions = (
    <div
      className={classNames(
        "form-actions",
        buttonEnd && "end",
        actionsClassName,
      )}
    >
      <Button
        type="submit"
        color="primary"
        variant="submit"
        disabled={resolvedSubmitDisabled}
        name={submitName}
        aria-label={submitAriaLabel}
      >
        {isLoading ? (
          <Loading
            color="stroke-base"
            loaderClass="!w-6 mt-1"
            strokeWidth="6"
          />
        ) : null}
        {resolvedSubmitLabel}
      </Button>
      <Button
        type="button"
        variant="outlined"
        disabled={resolvedCancelDisabled}
        onClick={handleCancel}
        name={cancelName}
        aria-label={cancelAriaLabel}
      >
        {resolvedCancelLabel}
      </Button>
    </div>
  );

  return (
    <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
      {children}
      {renderActions
        ? renderActions({
            isLoading,
            submitDisabled: resolvedSubmitDisabled,
            cancelDisabled: resolvedCancelDisabled,
            submitLabel: resolvedSubmitLabel,
            cancelLabel: resolvedCancelLabel,
            onCancel: handleCancel,
            submitAriaLabel,
            cancelAriaLabel,
            submitName,
            cancelName,
            defaultActions,
            buttonProps: {
              submit: {
                type: "submit",
                disabled: resolvedSubmitDisabled,
                name: submitName,
                "aria-label": submitAriaLabel,
              },
              cancel: {
                type: "button",
                disabled: resolvedCancelDisabled,
                name: cancelName,
                "aria-label": cancelAriaLabel,
              },
            },
          })
        : defaultActions}
    </form>
  );
};
