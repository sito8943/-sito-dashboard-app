// @sito/dashboard
import { Loading } from "@sito/dashboard";

// types
import { DialogActionsProps } from "./types";

// components
import { Button } from "components";

// styles
import "./styles.css";

export const DialogActions = (props: DialogActionsProps) => {
  const {
    primaryText,
    cancelText,
    onPrimaryClick,
    onCancel,
    isLoading = false,
    disabled = false,
    primaryType = "submit",
    containerClassName = "",
    primaryClassName = "",
    alignEnd = false,
    primaryName,
    primaryAriaLabel,
    cancelName,
    cancelAriaLabel,
  } = props;

  return (
    <div
      className={`dialog-actions ${alignEnd ? "end" : ""} ${containerClassName}`}
    >
      <Button
        type={primaryType}
        color="primary"
        variant="submit"
        className={primaryClassName}
        disabled={disabled}
        onClick={onPrimaryClick}
        name={primaryName}
        aria-label={primaryAriaLabel}
      >
        {isLoading ? (
          <Loading
            color="stroke-base"
            loaderClass="!w-6 mt-1"
            strokeWidth="6"
          />
        ) : null}
        {primaryText}
      </Button>
      <Button
        type="button"
        variant="outlined"
        disabled={disabled}
        onClick={onCancel}
        name={cancelName}
        aria-label={cancelAriaLabel}
      >
        {cancelText}
      </Button>
    </div>
  );
};
