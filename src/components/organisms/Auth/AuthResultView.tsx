import { Button, classNames, Loading } from "@sito/dashboard";

import { AuthScreenShell } from "./AuthScreenShell";

import type { AuthResultViewPropsType } from "./types";

export const AuthResultView = (props: AuthResultViewPropsType) => {
  const {
    description,
    loading = false,
    loadingLabel,
    actions,
    primaryAction,
    secondaryAction,
    descriptionClassName,
    ...screenProps
  } = props;

  const renderedActions =
    actions ??
    (loading ? (
      <div className="auth-result-loading" aria-live="polite">
        <Loading
          color="stroke-primary"
          loaderClass="auth-loading-icon"
          className="auth-loading"
          strokeWidth="6"
        />
        {loadingLabel && <span>{loadingLabel}</span>}
      </div>
    ) : (
      <>
        {primaryAction && (
          <Button
            type="button"
            color="primary"
            variant="submit"
            className={classNames(
              "auth-action-button",
              primaryAction.className,
            )}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            aria-label={primaryAction.ariaLabel}
          >
            {primaryAction.children}
          </Button>
        )}
        {secondaryAction && (
          <Button
            type="button"
            variant="outlined"
            className={classNames(
              "auth-action-button",
              secondaryAction.className,
            )}
            disabled={secondaryAction.disabled}
            onClick={secondaryAction.onClick}
            aria-label={secondaryAction.ariaLabel}
          >
            {secondaryAction.children}
          </Button>
        )}
      </>
    ));

  return (
    <AuthScreenShell {...screenProps} actions={renderedActions}>
      {description && (
        <p
          className={classNames(
            "auth-result-description",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </AuthScreenShell>
  );
};
