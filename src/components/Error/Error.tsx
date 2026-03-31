import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";

// components
import { Button } from "../Buttons";

// types
import { ErrorPropsType } from "./types";

// styles
import "./styles.css";

/**
 * Renders either a default error panel or fully custom error content.
 * @param props - Error props in default or custom-content mode.
 * @returns Error UI element.
 */
export function Error(props: ErrorPropsType) {
  const { t } = useTranslation();
  const hasCustomContent = "children" in props;

  if (hasCustomContent) {
    const { children, className } = props;
    return (
      <div className={`error-container${className ? ` ${className}` : ""}`}>
        {children}
      </div>
    );
  }

  const {
    error,
    message,
    iconProps,
    onRetry,
    retryLabel,
    retryButtonProps,
    messageProps,
    className,
    resetErrorBoundary,
  } = props;

  const retryAction = onRetry ?? resetErrorBoundary;
  const {
    className: retryClassName,
    children: retryChildren,
    onClick: retryOnClick,
    ...restRetryButtonProps
  } = retryButtonProps ?? {};
  const { className: messageClassName, ...restMessageProps } =
    messageProps ?? {};
  const shouldRenderIcon = iconProps !== null;

  return (
    <div className={`error-container${className ? ` ${className}` : ""}`}>
      {shouldRenderIcon && (
        <FontAwesomeIcon
          {...iconProps}
          icon={iconProps?.icon ?? faSadTear}
          className={`error-icon${iconProps?.className ? ` ${iconProps.className}` : ""}`}
        />
      )}
      <p
        {...restMessageProps}
        className={`error-message${messageClassName ? ` ${messageClassName}` : ""}`}
      >
        {message ?? error?.message ?? t("_accessibility:errors.unknownError")}
      </p>
      {retryAction && (
        <Button
          type="button"
          variant="submit"
          color="primary"
          {...restRetryButtonProps}
          className={`error-retry ${retryClassName ? ` ${retryClassName}` : ""}`}
          onClick={(e) => {
            retryOnClick?.(e);
            if (!e.defaultPrevented) retryAction();
          }}
        >
          {retryChildren ??
            retryLabel ??
            t("_accessibility:actions.retry", { defaultValue: "Retry" })}
        </Button>
      )}
    </div>
  );
}
