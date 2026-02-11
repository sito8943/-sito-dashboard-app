// @sito/dashboard
import { Loading } from "@sito/dashboard";

// components
import { Button } from "components";

type DialogActionsProps = {
  primaryText: string;
  cancelText: string;
  onPrimaryClick?: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  primaryType?: "button" | "submit";
  containerClassName?: string;
  primaryClassName?: string;
  alignEnd?: boolean;
  primaryName?: string;
  primaryAriaLabel?: string;
  cancelName?: string;
  cancelAriaLabel?: string;
};

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
      className={`flex gap-2 mt-2 ${alignEnd ? "justify-end" : ""} ${containerClassName}`}
    >
      <Button
        type={primaryType}
        color="primary"
        variant="submit"
        className={primaryClassName}
        disabled={disabled}
        onClick={primaryType === "button" ? onPrimaryClick : undefined}
        name={primaryName}
        aria-label={primaryAriaLabel}
      >
        {isLoading ? <Loading color="stroke-base" loaderClass="!w-6 mt-1"  strokeWidth="6" /> : null}
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
