import { useTranslation } from "@sito/dashboard";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSadTear } from "@fortawesome/free-regular-svg-icons";

// types
import { ErrorPropsType } from "./types";

// styles
import "./styles.css";

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
  const { className: retryClassName, children: retryChildren, ...restRetryButtonProps } =
    retryButtonProps ?? {};
  const { className: messageClassName, ...restMessageProps } = messageProps ?? {};
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
        <button
          type="button"
          {...restRetryButtonProps}
          className={`error-retry${retryClassName ? ` ${retryClassName}` : ""}`}
          onClick={(e) => {
            restRetryButtonProps.onClick?.(e);
            if (!e.defaultPrevented) retryAction();
          }}
        >
          {retryChildren ??
            retryLabel ??
            t("_accessibility:actions.retry", { defaultValue: "Retry" })}
        </button>
      )}
    </div>
  );
}
